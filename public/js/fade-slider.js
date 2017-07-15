jQuery(document).ready(function ($) {
    "use strict";

    var $ = jQuery,
        screenRes = $(window).width();

    // start fade slider
    jQuery('.fw-fade-slider').each( function(){
        var animateClass;
        var slider      = jQuery(this).find('.myCarousel');
        var slider_id   = slider.attr('id');
        var interval    = parseInt( slider.attr('data-slides-interval') );
        var first_image = slider.find('.fw-first-slider-image').attr('data-image');

        jQuery('.'+slider_id).prepend('<img src="'+first_image+'" alt="" class="testimage hidden">');
        jQuery('.testimage').load(function () {
            jQuery('.fw-wrap-fade-slider.'+slider_id+' .spinner, .'+slider_id+' .testimage').remove();
            jQuery('.'+slider_id).removeClass('invisible').addClass('animated fadeIn');
        });

        slider.carousel({
            interval: interval,
            pause: 'none'
        });

        slider.find('[data-animate-in]').addClass('animated');

        function animateSlide() {
            slider.find('.item').removeClass('current');

            slider.find('.active').addClass('current').find('[data-animate-in]').each(function () {
                var $this = jQuery(this);
                animateClass = $this.data('animate-in');
                $this.addClass(animateClass)
            });

            slider.find('.active').find('[data-animate-out]').each(function () {
                var $this = jQuery(this);
                animateClass = $this.data('animate-out');
                $this.removeClass(animateClass)
            });
        }

        function animateSlideEnd() {
            slider.find('.active').find('[data-animate-in]').each(function () {
                var $this = jQuery(this);
                animateClass = $this.data('animate-in');
                $this.removeClass(animateClass)
            });
            slider.find('.active').find('[data-animate-out]').each(function () {
                var $this = jQuery(this);
                animateClass = $this.data('animate-out');
                $this.addClass(animateClass)
            });
        }

        slider.find('.invisible').removeClass('invisible');
        animateSlide();

        slider.on('slid.bs.carousel', function () {
            animateSlide();
        });
        slider.on('slide.bs.carousel', function () {
            animateSlideEnd();
        });

        if (Modernizr.touch) {
            slider.find('.carousel-inner').swipe({
                swipeLeft: function () {
                    jQuery(this).parent().carousel('prev');
                },
                swipeRight: function () {
                    jQuery(this).parent().carousel('next');
                },
                threshold: 30
            })
        }
        // Call function for item height calculate
        if(screenRes < 768){
            fadeSliderSetItemHeight(slider);

            $(window).on('resize', function () {
                slider.find('.item').css('height', 'auto');
                fadeSliderSetItemHeight(slider);
            });
        }

        // Slider Full Position Indicators
        var slider_full = jQuery(".fw-wrap-fade-slider"),
            indicator_width = $(this).find('.carousel-indicators').outerWidth(),
            indicator_height = 0;

        if($(this).parents('.fw-container').length > 0){
            jQuery('.fw-wrap-fade-slider .carousel-indicators').css('margin-left', -(indicator_width / 2));
        }
        else if($(this).parents('.fw-container-fluid').length > 0){
            jQuery('.fw-wrap-fade-slider .carousel-indicators li').each(function () {
                indicator_height += $(this).outerHeight() + 6;
                jQuery('.fw-wrap-fade-slider .carousel-indicators').css('margin-top', -(indicator_height / 2));
            });
        }
        slider_full.parent('.fw-col-inner').parent(".fw-col-sm-12").parent(".fw-row").css('display', 'block');
        slider_full.parent('.fw-col-inner').parent(".fw-col-sm-12").parent(".fw-row").parent(".fw-container-fluid").css('display', 'block');
    });
});

// Set height slide for mobile screen
function fadeSliderSetItemHeight(slider) {
    var totalSlideHeight = 0;
    slider.find('.item').each(function(){
        var itemHeight = $(this).outerHeight();

        if (itemHeight > totalSlideHeight) {
            totalSlideHeight = itemHeight;
        }
    });
    slider.find('.item').css({'height': totalSlideHeight});
};