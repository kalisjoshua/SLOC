window.jQuery && ($.fn.sloc = function (config) {
    var _br = "<br/>"
        ,_defaults = {
            delay: 600
            ,focus: true
            ,gutter: "gutter"
            ,liveHeight: false // feature - maximize height of textarea to fit all content
            ,liveWidth: false
            ,IEtweak: 50
            ,scrollbars: $.browser.msie && parseInt($.browser.version, 10) < 9 ? 18 : 0
        }
        ,_rlines = /\n/g
        ,_timeouts= {};
    
    config = $.extend({}, _defaults, config);

    function _fixHeight (el) {
        clearTimeout(_timeouts.ht);

        _timeouts.ht = setTimeout(function () {
            el.style.height = "10px";
            setTimeout(function () {el.style.height = config.scrollbars + (!config.liveWidth ? 18 : 0) + el.scrollHeight + "px";}, 1);
        }, config.delay);
    };

    function _fixWidth (el) {
        clearTimeout(_timeouts.wd);

        _timeouts.wd = setTimeout(function () {
            el.style.width = "10px";
            setTimeout(function () {el.style.width = config.scrollbars + el.scrollWidth + "px";}, 1);
        }, config.delay);
    };

    function _focus () {
        $(this).parent().toggleClass("focus");
    };

    function _keyup (event) {
        var el = $(event.target)
            ,lines = 1 + (el.val().match(_rlines) || []).length
            ,numbers = el.data(config.gutter)

            ,max = (numbers.html().match(/\d+/g) || []).length;
        
        el.parent().removeClass("error valid warn")

        config.liveHeight && _fixHeight(el[0]);
        config.liveWidth && _fixWidth(el[0]);

        if (max !== lines) {
            max > lines
                ? _lnRemove(numbers, max - lines)
                : _lnAdd(numbers, lines - max - 1, max, _br);
        }
    };

    function _lnAdd (el, num, seed, bonus) {
        var i = seed |= 0
            ,lines = [];

        num = num + seed;
        while (i++ <= num && lines.push(i));

        // feature - detect soft-warpped lines

        el.append((bonus || "") + lines.join(_br));
    };

    function _lnRemove (el, count) {
        el.html(el
            .html()
            .match(/\d+/g) // look at the numbers instead of the newlines because IE sucks
            .slice(0, -count)
            .join(_br));
    };

    function _scrollHelper (event) {
        var target = event.target;

        // IE bug - scrolling is jumpy; related to scrollTop
        setTimeout(function () {
            $(target)
                .data(config.gutter)
                    .css("top", -target.scrollTop);
        }, config.IEtweak);
    };

    return this
        .each(function () {
            var self = $(this);
            
            self
                .attr("wrap", "off")
                .data(config.gutter, $('<div>').addClass(config.gutter))
                .scroll(_scrollHelper)
                .wrap('<div class="sloc">')
                .parent()
                    .append(self.data(config.gutter))
                    .keyup(_keyup);
            
            config.focus && self.blur(_focus).focus(_focus);

            config.liveHeight && _fixHeight(self[0]);
            config.liveWidth && _fixWidth(self[0]);

            // start out with the line numbers for what is in the textarea already
            _lnAdd(self.data(config.gutter), (self.val().match(_rlines) || []).length);
        });
});