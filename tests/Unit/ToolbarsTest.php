<?php
use Doubleedesign\DoubleeTinymce\{Toolbars, ToolbarUtils};
use function Spies\mock_object_of;

beforeEach(function() {
    // Mock a simplified default config
    $mock = Mockery::mock('alias:' . ToolbarUtils::class)->makePartial()->shouldIgnoreMissing();
    $mock->shouldReceive('get_default_rows')->andReturn([
        ['removeformat', 'alignleft', 'aligncenter', 'alignright'],
        ['bold', 'italic', 'strikethrough'],
        [],
        ['undo', 'redo', 'pastetext', 'wp_help']
    ]);
});

describe('Toolbars', function() {

    it('applies customisations to default toolbar rows', function() {
        $mock = Mockery::mock('Doubleedesign\DoubleeTinymce\Toolbars')->makePartial();
        $mock->shouldAllowMockingProtectedMethods();
        $mock = mock_object_of($mock);

        $spy1 = $mock->spy_on_method('set_default_top_row');
        $spy2 = $mock->spy_on_method('set_default_second_row');
        $spy3 = $mock->spy_on_method('set_default_third_row');
        $spy4 = $mock->spy_on_method('set_default_fourth_row');
        $mock->__call('__construct', []);

        apply_filters('mce_buttons', [], $spy1);
        apply_filters('mce_buttons_2', [], $spy2);
        apply_filters('mce_buttons_3', [], $spy3);
        apply_filters('mce_buttons_4', [], $spy4);

        expect($spy1)->was_called()->toBeTrue()
            ->and($spy2)->was_called()->toBeTrue()
            ->and($spy3)->was_called()->toBeTrue()
            ->and($spy4)->was_called()->toBeTrue();
    });

    it('applies the default config to a toolbar row', function() {
        new Toolbars();

        $top_row = apply_filters('mce_buttons', []);

        expect($top_row)->toEqual(['removeformat', 'alignleft', 'aligncenter', 'alignright']);
    });

    it('it overrides another filter added at an earlier priority before the class is instantiated', function() {
        // fullscreen is one of the default always-remove items
        add_filter('mce_buttons_2', fn($buttons) => [...$buttons, 'fullscreen'], 1);
        new Toolbars();

        $result = apply_filters('mce_buttons_2', []);

        expect($result)->not->toContain('fullscreen');
    });

    // FIXME: Not passing
    it('it overrides another filter added at an earlier priority after the class is instantiated', function() {
        new Toolbars();
        add_filter('mce_buttons_2', fn($buttons) => [...$buttons, 'fullscreen'], 1);

        $result = apply_filters('mce_buttons_2', []);

        expect($result)->not->toContain('fullscreen');
    });

    it('respects another filter added at a later priority after the class is instantiated', function() {
        new Toolbars();
        add_filter('mce_buttons_2', fn($buttons) => [...$buttons, 'fullscreen'], 100);

        $result = apply_filters('mce_buttons_2', []);

        expect($result)->toContain('fullscreen');
    });

    // FIXME: Not passing
    it('respects another filter added at a later priority before the class is instantiated', function() {
        add_filter('mce_buttons_2', fn($buttons) => [...$buttons, 'fullscreen'], 100);
        new Toolbars();

        $result = apply_filters('mce_buttons_2', []);

        expect($result)->toContain('fullscreen');
    });
});
