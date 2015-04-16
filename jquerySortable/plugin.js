/*!
 * jQuery QueryBuilder Sortable
 * Enables drag & drop sort of rules.
 * Copyright 2014-2015 Damien "Mistic" Sorel (http://www.strangeplanet.fr)
 */

       QueryBuilder.define('jqsortable', function (options) {
        /**
         * Init HTML5 drag and drop
         */

        this.on('afterInit', function (e) {
            // configure jQuery to use dataTransfer
            $.event.props.push('dataTransfer');

            var placeholder, src,
                self = e.builder;
            var element;
            var targetElement;
            var hoverElement;

            // only add "draggable" attribute when hovering drag handle
            // preventing text select bug in Firefox
            self.$el.on('mouseover', '.drag-handle', function () {
                self.$el.find('.rule-container, .rules-group-container').addClass('dragme');
                setSelected(self.$el);

                $(this).closest('.dragme').draggable({
                    helper: 'clone',
                    //  helper: function () {
                    //      var newNode = this.cloneNode(true);
                    //      var editNode = setSelected($(newNode));
                    //      return ($(editNode));
                    //  },
                    opacity: 0.5,
                    cursorAt: { left: -20, top: -10 },

                    start: function (event, ui) {

                        $(ui.helper).addClass("col-lg-9");

                        src = Model($(this));

                        var ph = $('<div id="placeHolder" class="rule-placeholder">&nbsp;</div>');
                        ph.css('min-height', $(this).height());

                        placeholder = src.parent.addRule(ph, src.getPos());

                        $(this).hide();

                    },
                    drag: function (e, ui) {

                        var x = event.clientX, y = event.clientY,
                        elementMouseIsOver = document.elementFromPoint(x, y);

                        targetElement = $(elementMouseIsOver);

                        if (placeholder) {
                            moveSortableToTarget(placeholder, targetElement);
                        }

                    },
                    stop: function () {

                        moveSortableToTarget(src, targetElement);

                        src.$el.show();
                        placeholder.drop();

                        src = placeholder = null;

                        self.$el.find('.rule-container, .rules-group-container').removeAttr('draggable');
                    }
                });
            });


        });

        /**
         * Remove drag handle from non-sortable rules
         */
        this.on('parseRuleFlags.filter', function (flags) {
            if (flags.value.no_sortable === undefined) {
                flags.value.no_sortable = options.default_no_sortable;
            }
        });

        this.on('afterApplyRuleFlags', function (e, rule) {
            if (rule.flags.no_sortable) {
                rule.$el.find('.drag-handle').remove();
            }
        });

        /**
         * Modify templates
         */
        this.on('getGroupTemplate.filter', function (h, level) {
            if (level > 1) {
                var $h = $(h.value);
                $h.find('.group-conditions').after('<div class="drag-handle"><i class="' + options.icon + '"></i></div>');
                h.value = $h.prop('outerHTML');
            }
        });

        this.on('getRuleTemplate.filter', function (h) {
            var $h = $(h.value);
            $h.find('.rule-header').after('<div class="drag-handle"><i class="' + options.icon + '"></i></div>');
            h.value = $h.prop('outerHTML');
        });
    }, {
        default_no_sortable: false,
        icon: 'glyphicon glyphicon-sort'
    });
	
	/**
 * Move an element (placeholder or actual object) depending on active target
 * @param {Node}
 * @param {jQuery}
 */
function moveSortableToTarget(element, target) {
    var parent;

    // on rule
    parent = target.closest('.rule-container');
    if (parent.length) {
        element.moveAfter(Model(parent));
        return;
    }

    // on group header
    parent = target.closest('.rules-group-header');
    if (parent.length) {
        parent = target.closest('.rules-group-container');
        element.moveAtBegin(Model(parent));
        return;
    }

    // on group
    parent = target.closest('.rules-group-container');
    if (parent.length) {
        element.moveAtEnd(Model(parent));
        return;
    }
}
	
	 function setSelected(ui) {

        var y = $(ui).find("select option");

        $.each(y, function (key, value) {

            if ($(value).val() === $(this).closest('select').val()) {
                $(this).attr("selected", "selected");
            }
        });
    }