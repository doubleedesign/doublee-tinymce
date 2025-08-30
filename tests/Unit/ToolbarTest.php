<?php
use Doubleedesign\DoubleeTinymce\{Toolbar, ToolbarUtils};

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

describe('Toolbar', function() {

    it('uses default buttons for the given row index if none are provided', function() {
        $toolbar = new Toolbar(0);
        $result = $toolbar->get_buttons();

        expect($result)->toBe(['removeformat', 'alignleft', 'aligncenter', 'alignright']);
    });

    it('uses provided buttons alongside defaults if they are not already present', function() {
        $toolbar = new Toolbar(0, ['table']);
        $result = $toolbar->get_buttons();

        expect($result)->toBe(['removeformat', 'alignleft', 'aligncenter', 'alignright', 'table']);
    });

    it('filters out a default always-removed button', function() {
        $toolbar = new Toolbar(0, ['removeformat', 'fullscreen']);
        $result = $toolbar->get_buttons();

        expect($result)->not->toContain('fullscreen');
    });

    it('filters out a developer-provided always-removed button', function() {
        add_filter('doublee_tinymce_always_remove_buttons', fn($buttons) => [...$buttons, 'alignleft']);

        $toolbar = new Toolbar(0, ['alignleft', 'aligncenter']); // these are included in the mocked default row 0
        $result = $toolbar->get_buttons();

        expect($result)->not->toContain('alignleft');
    });

    it('does not filter out a default always-removed button if specified to keep', function() {
        add_filter('doublee_tinymce_always_remove_buttons', fn($buttons) => array_filter($buttons, fn($button) => $button !== 'forecolor'));

        $toolbar = new Toolbar(0, ['removeformat', 'alignleft', 'forecolor']);
        $result = $toolbar->get_buttons();

        expect($result)->toContain('forecolor');
    });

    it('deduplicates buttons in the top row if already present in another row', function() {
        $toolbar = new Toolbar(0, ['removeformat', 'bold']);
        $result = $toolbar->get_buttons();

        expect($result)->toContain('removeformat')
            ->and($result)->not->toContain('bold');
    });

    it('deduplicates buttons in another row if already present in the top row', function() {
        $toolbar = new Toolbar(1, ['bold', 'italic', 'strikethrough', 'aligncenter']);
        $result = $toolbar->get_buttons();

        expect($result)->toBe(['bold', 'italic', 'strikethrough']);
    });
});
