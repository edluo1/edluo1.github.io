function findBootstrapEnvironment() {
    var envs = ['xs', 'sm', 'md', 'lg'];

    var $el = $('<div>');
    $el.appendTo($('body'));

    for (var i = envs.length - 1; i >= 0; i--) {
        var env = envs[i];

        $el.addClass('hidden-' + env);
        if ($el.is(':hidden')) {
            $el.remove();
            return env;
        }
    }
}

(function($, viewport){
    $(document).ready(function () {
        $('#arrow').text(function () {
            if (viewport.is('xs') | viewport.is('sm')) {
                return '^';
            } else {
                return '<-';
            }
        });
        $(window).resize(
                viewport.changed(function () {
                    $('#arrow').text(function () {
                        if (viewport.is('xs') | viewport.is('sm')) {
                            return '^';
                        } else {
                            return '<-';
                        }
                    });
                })
            );
    });
})(jQuery, ResponsiveBootstrapToolkit);