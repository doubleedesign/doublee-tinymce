<?php

namespace Doubleedesign\DoubleeTinymce;

class EditorUI {

    public function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_tinymce_ui_styles']);
    }

    public function enqueue_tinymce_ui_styles(): void {
        wp_enqueue_style(
            'doublee-tinymce-editor-ui',
            plugins_url('src/editor-ui.css', dirname(__FILE__)),
            array(),
            PluginEntrypoint::get_version()
        );
    }
}
