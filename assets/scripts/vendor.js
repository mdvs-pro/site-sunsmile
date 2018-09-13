// IIFE - Immediately Invoked Function Expression
(function($, window, document) {

  $(function() {
    // save some methods to global
    burgerMenu = animatedBurgerMenu();

    smoothLinks();
    // faqAccordion();
    // modalWindow();
    // if (!isViewportLower('md')) {
    //   initParallaxOnMouseMove();
    // }
    // newsSlick();
  });

  // global variables
  var burgerMenu;
  var menuActiveClass = 'menu-opened';

  // on load actions
  $(window).on('load', function(){
    adaptiveMenu();
    testimonials();
  });

  // check if size lower than breakpoint
  function isViewportLower(size) {
    var sizes = {
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1500,
    };

    return window.innerWidth < sizes[size];
  }

  // Smooth anchor links
  // take all links with '#' and more than 1 symbol
  function smoothLinks(){
    $(document).on('click touch', 'a[href*="#"]', function (event) {
      console.log('event');
      // Remove links that don't actually link to anything
      if (this.getAttribute('href').length < 1 || this.getAttribute('href') == '#0') return;

      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        if ($('body').hasClass('preview-open')){
          $('body').trigger("modal:close");
        }
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000);
        }
      }
    });
  }

  // Accordion
  // open, close, focus
  // focus inits only when current target/active item goes next then previous active item
  function faqAccordion() {
    var $target = $('#js-faq-accordion');
    $target.find('.faq__header').on('click touch', function(){
      var $newTarget = $(this).parents('.faq__item');
      if (!$newTarget.hasClass('active')) {
        var oldTargetIndex = $target.find('.faq__item.active').index()
        $target.find('.faq__item').removeClass('active');

        if (oldTargetIndex != -1 && oldTargetIndex < $newTarget.index()){
          setTimeout(() => {
            $('html, body').animate({
              scrollTop: $newTarget.offset().top
            }, 1000);
          }, 500);
        }
      }
      $newTarget.toggleClass('active');
    });
  }

  // MODAL
  // LINK: https://tympanus.net/Development/GridLayoutMotion/
  // NOTICE: modified version
  // REQUIRED: animatedBurgerMenu
  function modalWindow() {
    // helpers
    const lineEq = (y2, y1, x2, x1, currentVal) => {
      // y = mx + b
      var m = (y2 - y1) / (x2 - x1), b = y1 - m * x1;
      return m * currentVal + b;
    };

    // Modal events
    class Overlay {
      constructor() {
          this.DOM = {el: document.querySelector('.overlay')};
          this.DOM.reveal = this.DOM.el.querySelector('.overlay__reveal');
          this.DOM.items = this.DOM.el.querySelectorAll('.overlay__item');
          this.DOM.close = this.DOM.el.querySelector('.overlay__close');
          this.DOM.header = this.DOM.el.querySelector('.overlay__header');
      }
      show(contentItem) {
          this.contentItem = contentItem;
          this.DOM.el.classList.add('overlay--open');
          // show revealer
          TweenMax.to(this.DOM.reveal, .5, {
              ease: 'Power1.easeInOut',
              x: '0%',
              onComplete: () => {
                  // hide scroll
                  document.body.classList.add('preview-open');
                  // show preview
                  this.revealItem(contentItem);
                  // hide revealer
                  TweenMax.to(this.DOM.reveal, .5, {
                      delay: 0.2,
                      ease: 'Power3.easeOut',
                      x: '-100%'
                  });

                  this.DOM.close.style.opacity = 1;
                  this.DOM.header.style.opacity = 1;
              }
          });
      }
      revealItem() {
          this.contentItem.classList.add('overlay__item--active');

          let itemElems = [];
          itemElems.push(this.contentItem.querySelector('.box__shadow'));
          itemElems.push(this.contentItem.querySelector('.box__img'));
          itemElems.push(this.contentItem.querySelector('.box__title'));
          itemElems.push(this.contentItem.querySelector('.box__text'));
          itemElems.push(this.contentItem.querySelector('.box__deco'));
          itemElems.push(this.contentItem.querySelector('.overlay__content'));

          for (let el of itemElems) {
              if ( el == null ) continue;
              const bounds = el.getBoundingClientRect();
              const win = {width: window.innerWidth, height: window.innerHeight};
              TweenMax.to(el, lineEq(0.8, 1.2, win.width, 0, Math.abs(bounds.left+bounds.width - win.width)), {
                  ease: 'Expo.easeOut',
                  delay: 0.2,
                  startAt: {
                      x: `${lineEq(0, 800, win.width, 0, Math.abs(bounds.left+bounds.width - win.width))}`,
                      // y: `${lineEq(-100, 100, win.height, 0, Math.abs(bounds.top+bounds.height - win.height))}`,
                      // rotationZ: `${lineEq(5, 30, 0, win.width, Math.abs(bounds.left+bounds.width - win.width))}`
                  },
                  x: 0,
                  y: 0,
                  rotationZ: 0
              });
          }
      }
      hide() {
          this.DOM.el.classList.remove('overlay--open');

          // show revealer
          TweenMax.to(this.DOM.reveal, .5, {
              //delay: 0.15,
              ease: 'Power3.easeOut',
              x: '0%',
              onComplete: () => {
                  this.DOM.close.style.opacity = 0;
                  this.DOM.header.style.opacity = 0;
                  // show scroll
                  document.body.classList.remove('preview-open');
                  // hide preview
                  this.contentItem.classList.remove('overlay__item--active');
                  // this.contentItem.style.opacity = 0;
                  // hide revealer
                  TweenMax.to(this.DOM.reveal, .5, {
                      delay: 0,
                      ease: 'Power3.easeOut',
                      x: '100%'
                  });
              }
          });
      }
    }
    class Modal {
      constructor() {
        var self = this;
        // YB: remake to dynamic elements
        $(document).on('click touch', '.modal-trigger', function(ev){
          ev.preventDefault();
          // YB: take data attribute insead href
          console.log(this);
          self.openItem(document.querySelector(this.getAttribute('data-modal')));
        });


        this.overlay = new Overlay();
        $(this.overlay.DOM.close).on('click touch', (e) => this.closeItem(e));
        $('body').on('modal:close', (e) => this.closeItem(e));
      }
      openItem(contentItem) {
        if (this.isPreviewOpen) return;
        this.isPreviewOpen = true;
        this.overlay.show(contentItem);
      }
      closeItem(e) {
        e.preventDefault();
        if (!this.isPreviewOpen) return;
        this.isPreviewOpen = false;
        this.overlay.hide();
        // YB: animate burger to default state
        if ($('body').hasClass(menuActiveClass)) {
          burgerMenu.close();
        }
      }
    }

    // init
    new Modal();
  }

  // Adaptive Menu
  // show, hide menu items if we don't have enough space in header
  // Stop working if window width lower than 991px [MD-BREAKPOINT]
  function adaptiveMenu() {
    // variables
    var $header = $('.header');
    var $menu = $header.find('.menu__list');
    var $headerChildren = $header.find('.row').eq(0).children();
    var $adaptiveMenu = $header.find('.menu__adaptive');
    var fadeInAdaptiveMenu = true;
    var emptySpace = 0;
    var hiddenItems = [];

    menuDropDown();

    // init on load
    reCalcMenu();
    // init on window resize
    $(window).on('resize', $.throttle(300, reCalcMenu));

    function reCalcMenu() {
      if (window.innerWidth <= 991) return; // MD-BREAKPOINT
      // width with some offset
      var headerWidth = $header.outerWidth() - 50;

      var totalWidth = Array.prototype.reduce.call($headerChildren, function (sum, element) {
        return sum + $(element).outerWidth();
      }, 0);

      if (headerWidth < totalWidth && $menu.length) {
        // show adaptive menu button
        if (!hiddenItems.length) activeAdaptiveMenu();
        removeFromMenu();
        // init function one more time
        // it will init until the menu won't fit in the header

        ($.throttle(100, reCalcMenu))();
      } else if (headerWidth > totalWidth && hiddenItems.length) {
        emptySpace = headerWidth - totalWidth - 20;

        if (hiddenItems[0].w < emptySpace) {
          insertBackToMenu();
          if (!hiddenItems.length) disableAdaptiveMenu();

          // check one more time if we have enought space for more items
          ($.throttle(100, reCalcMenu))();
        }
      } else {
        // do nothing
        return;
      }

    }

    function activeAdaptiveMenu() {
      fadeInAdaptiveMenu = false;
      $('.menu__adaptive').fadeIn();
    }

    function disableAdaptiveMenu() {
      fadeInAdaptiveMenu = true;
      $('.menu__adaptive').css('display', 'none');
    }

    function removeFromMenu(){
      // find and hide last item menu
      // also save it to the object
      var lastElement = $menu.find('.menu__item:last-child');
      var lastElementWidth = lastElement.outerWidth();
      var lastElementClone = lastElement.clone();

      $adaptiveMenu.find('ul').prepend(lastElementClone);

      hiddenItems.push({
        el: lastElement.remove(),
        w: lastElementWidth
      });

    }

    function insertBackToMenu() {
      var menuItem = hiddenItems.pop();
      menuItem.el.appendTo($menu);
      // remove from adaptive menu
      $adaptiveMenu.find('ul > li:first-child').remove()
    }

    function menuDropDown() {
      var activeClass = 'clicked';
      var menuClass = 'menu__adaptive';
      var className = 'dropdown';
      var $trigger = $adaptiveMenu.find('.' + className);


      // init adaptive menu opening
      $adaptiveMenu.find('span').eq(0).on('click touch', function () {
        toggle();
      });

      $(document).on('click touch', function(event){
        var $currentTarget = $(event.target);
        // close when user click somewhere but not on menu__adaptive oh his child elements
        if ($adaptiveMenu.hasClass(activeClass) && !($currentTarget.parents('.' + menuClass).length || $currentTarget.hasClass(menuClass))) {
          close();
        }
      });

      function toggle(){
        $adaptiveMenu.toggleClass(activeClass);
      }

      function close() {
        $adaptiveMenu.removeClass(activeClass);
      }
    }
  }

  // Parallax Effect
  // LINK: https://github.com/wagerfield/parallax
  function initParallaxOnMouseMove() {
    var scene = document.getElementById('scene');
    if (scene !== null) var parallax = new Parallax(scene);
  }

  // Burger Menu
  // LINK: https://tympanus.net/Tutorials/AnimatedMenuIcon/
  // NOTICE: modified version
  // return {open: F, close: F}
  function animatedBurgerMenu() {
    /* In animations (to close icon) */

    var beginAC = 80,
      endAC = 320,
      beginB = 80,
      endB = 320;

    function inAC(s) {
      s.draw('80% - 240', '80%', 0.3, {
        delay: 0.1,
        callback: function () {
          inAC2(s)
        }
      });
    }

    function inAC2(s) {
      s.draw('100% - 545', '100% - 305', 0.6, {
        easing: ease.ease('elastic-out', 1, 0.3)
      });
    }

    function inB(s) {
      s.draw(beginB - 60, endB + 60, 0.1, {
        callback: function () {
          inB2(s)
        }
      });
    }

    function inB2(s) {
      s.draw(beginB + 120, endB - 120, 0.3, {
        easing: ease.ease('bounce-out', 1, 0.3)
      });
    }

    /* Out animations (to burger icon) */

    function outAC(s) {
      s.draw('90% - 240', '90%', 0.1, {
        easing: ease.ease('elastic-in', 1, 0.3),
        callback: function () {
          outAC2(s)
        }
      });
    }

    function outAC2(s) {
      s.draw('20% - 240', '20%', 0.3, {
        callback: function () {
          outAC3(s)
        }
      });
    }

    function outAC3(s) {
      s.draw(beginAC, endAC, 0.7, {
        easing: ease.ease('elastic-out', 1, 0.3)
      });
    }

    function outB(s) {
      s.draw(beginB, endB, 0.7, {
        delay: 0.1,
        easing: ease.ease('elastic-out', 2, 0.4)
      });
    }

    /* Awesome burger default */

    var pathA = document.getElementById('pathA'),
        pathB = document.getElementById('pathB'),
        pathC = document.getElementById('pathC'),
        segmentA = new Segment(pathA, beginAC, endAC),
        segmentB = new Segment(pathB, beginB, endB),
        segmentC = new Segment(pathC, beginAC, endAC),
        trigger = document.getElementById('menu-icon-trigger'),
        toCloseIcon = true,
        // dummy = document.getElementById('dummy'),
        wrapper = document.getElementById('menu-icon-wrapper');

    wrapper.style.visibility = 'visible';

    trigger.onclick = function () {
      if (toCloseIcon) {
        changeToOpen();
      } else {
        changeToClose();
      }
      toCloseIcon = !toCloseIcon;
    };

    function changeToOpen() {
      inAC(segmentA);
      inB(segmentB);
      inAC(segmentC);
      $('body').addClass(menuActiveClass);
    }

    function changeToClose() {
      outAC(segmentA);
      outB(segmentB);
      outAC(segmentC);
      $('body').removeClass(menuActiveClass);
    }

    return {
      open: changeToOpen,
      close: changeToClose
    }
  }

  function testimonials() {
    var t = $('.testimonials__item');
    var tBodyHeight = 0;
    var tHeight = 0;
    t.each((i, item) => {
      tBodyHeight = $(item).find('.testimonials__body').innerHeight();
      tHeight = $(item).find('.testimonials__body > .box').innerHeight();
      if (tHeight > tBodyHeight) {
        createOpenable(item);
      }
    });

    function createOpenable(item) {
      $(item).addClass('openable');
      $(item).on('click touch', function(){
        $(this).removeClass('openable');
        showFull(this);
      });
    }

    function showFull(item) {
      $(item).find('.testimonials__body').css({'max-height': '1000px'});
      // turn off click event
      $(item).off('click touch');
    }
  }

  function newsSlick() {
    $('#news__slider').slick({
      infinite: true,
      dots: false,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 3,
      arrows: false,
      responsive: [
        {
          breakpoint: 1000,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 2
          }
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1
          }
        }
      ]
    });

    $('#js-news__slider-prev').on('click touch', function(){
      $('#news__slider').slick('slickPrev');
    });

    $('#js-news__slider-next').on('click touch', function () {
      $('#news__slider').slick('slickNext');
    });
  }

}(window.jQuery, window, document));