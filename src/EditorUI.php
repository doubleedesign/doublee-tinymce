<?php

namespace Doubleedesign\DoubleeTinymce;

class EditorUI {

    public function __construct() {
        add_action('admin_enqueue_scripts', [$this, 'enqueue_tinymce_ui_styles']);
	    add_filter('tiny_mce_before_init', [$this, 'explicitly_set_tinymce_style'], 5, 1);
    }

    public function enqueue_tinymce_ui_styles(): void {
        wp_enqueue_style(
            'doublee-tinymce-editor-ui',
            plugins_url('src/editor-ui.css', dirname(__FILE__)),
            array(),
            PluginEntrypoint::get_version()
        );
    }

	/**
	 * Ensure all instances of TinyMCE use the same base styling
	 * @param $settings
	 * @return array
	 */
	public function explicitly_set_tinymce_style($settings): array {
		$settings['skin'] = 'lightgray';
		$settings['theme'] = 'modern';

		return $settings;
	}
}
