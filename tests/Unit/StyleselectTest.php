<?php
use Doubleedesign\DoubleeTinymce\Styleselect;
use function Spies\mock_object_of;

describe('Custom formats menu', function() {

    it('adds the menu to the first TinyMCE toolbar', function() {
        $mock = Mockery::mock(Styleselect::class)->makePartial();
        $mock->shouldAllowMockingProtectedMethods();
        $mock = mock_object_of($mock);
        $spy = $mock->spy_on_method('add_styleselect');
        $mock->__call('__construct', []);

        apply_filters('mce_buttons', [], $spy);

        expect($spy)->was_called()->toBeTrue();
    });

    it('adds the menu to the start of the row', function() {
        new Styleselect();
        $buttons = apply_filters('mce_buttons', ['bold', 'italic']);

        expect($buttons)->toEqual(['styleselect', 'bold', 'italic']);
    });

    it('populates the menu on the expected initialisation filter', function() {
        $mock = Mockery::mock(Styleselect::class)->makePartial();
        $mock->shouldAllowMockingProtectedMethods();
        $mock = mock_object_of($mock);
        $spy = $mock->spy_on_method('populate_styleselect');
        $mock->__call('__construct', []);

        apply_filters('tiny_mce_before_init', [], $spy);

        expect($spy)->was_called()->toBeTrue();
    });

    it('populates the menu with default options', function() {
        $instance = new Styleselect();
        $result = $instance->populate_styleselect([]);

        expect($result['style_formats'])->toContain('Lead paragraph');
    });

    it('adds a developer-specified option to the menu', function() {
        add_filter('doublee_tinymce_styleselect_formats', function($options) {
            return [...$options, array(
                'title'   => 'Custom highlight',
                'inline'  => 'span',
                'classes' => 'is-style-highlight',
            )];
        });

        $instance = new Styleselect();
        $result = $instance->populate_styleselect([]);

        expect($result['style_formats'])->toContain('Custom highlight');
    });

    it('removes a developer-specified option from the defaults', function() {
        add_filter('doublee_tinymce_styleselect_formats', function($options) {
            return array_filter($options, function($option) {
                return $option['title'] !== 'Lead paragraph';
            });
        });

        $instance = new Styleselect();
        $result = $instance->populate_styleselect([]);

        expect($result['style_formats'])->not->toContain('Lead paragraph');
    });

});
