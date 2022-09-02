var game = new Game({path: ''});

// Controls for the console/game resizing
var resizingX = null;
$('.verticalGrabBar').on('mousedown', event => {
    resizingX = event.pageX - $('.verticalGrabBar').offset().left;
    event.preventDefault();
});
$(document).on('mousemove', event => {
    if (resizingX === null) return;
    // Subtract 8 here because we want these values relative to their container,
    // which has 8 pixel margins, but event.pageX doesn't take that into consideration.
    var position = Math.min(1600, Math.max(200, event.pageX - 8 - resizingX));
    $('.verticalGrabBar').prev().css('width', `${position}px`);
    $('.verticalGrabBar').css('left', `${position}px`);
    $('.verticalGrabBar').next().css('left', `${position + 8}px`);
});
$(document).on('mouseup', event => {
    resizingX = null;
});

// Loop for updating the display of the game.
var mainLoop = () => {
    if (state.cyclesChanged) {
        state.cyclesChanged = false;
        $('.js-cycles').text(state.cycles.abbreviate());
    }
    // Right now we have to update everything when the game changes...\
    if (game.needsUpdate) {
        var newContent = game.render();
        if (!$('.js-gameSections').find('div').length) {
            $('.js-gameSections').html(newContent);
        } else {
            var $newContent = $(newContent);
            var $updated = $newContent.find('.cmp-updated').first();
            var queue = $updated.length ? [$updated] : [];
            var safety = 0;
            while (queue.length && safety++ < 1000) {
                $updated = queue.shift();
                var $updatedChild = $updated.find('.cmp-updated').first();
                if ($updatedChild.length) {
                    queue.unshift($updated);
                    queue.unshift($updatedChild);
                } else {
                    // If this is the inner most updated component, find the markup for the current version,
                    // and replace it with the new version if they are actually different.
                    $updated.removeClass('cmp-updated');
                    var id = $updated.attr('id');
                    var $element = $(`#${id}`);
                    if ($element.length !== 1) {
                        throw new Error(`Found ${$element.length} instances of element with id ${id}, expected exactly 1!`);
                    }
                    if ($element[0].outerHTML !== $updated[0].outerHTML) {
                        // console.log($element[0].outerHTML, '->', $updated[0].outerHTML);
                        // console.log(`updating ${id}`);
                        $element.replaceWith($updated.clone());
                    }
                }
                // If the queue is empty, check to see if there are any more updated components to consider.
                if (!queue.length) {
                    $updated = $newContent.find('.cmp-updated').first();
                    if ($updated.length) {
                        queue = [$updated];
                    }
                }
            }
            if (safety >= 1000) {
                console.log(new Error('infinite loop?'));
            }
        }
        $('.cmp-updated').removeClass('cmp-updated');
        $('.cmp-new').removeClass('cmp-new');

        game.needsUpdate = false;
    }
};
setInterval(mainLoop, 20);

// Generic code for running actions on any elements with actions defined on them.
$('body').on('click', '[action]', function () {
    var action = $(this).attr('action');
    runCommand(action, true);
});

// Generic code for running actions on input elements that have submit-action defined on them.
$('body').on('keypress', '[submit-action]', function () {
    // We only care about pressing the enter/return key.
    if (event.which !== 13) return;
    var action = $(this).attr('submit-action');
    var value = $(this).val();
    if (isNaN(Number(value))) value = `"${value}"`;
    action = action.replace('{value}', value);
    runCommand(action, true);
});
