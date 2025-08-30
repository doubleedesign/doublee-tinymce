<?php
/**
 * Plugin Name: Double-E TinyMCE
 * Description: Customised configuration and plugins for WordPress/ClassicPress websites by Double-E Design.
 * Requires PHP: 8.3
 * Author: Double-E Design
 * Plugin URI: https://github.com/doubleedesign/doublee-tinymce
 * Author URI: https://www.doubleedesign.com.au
 * Version: 0.0.1
 * Text domain: doublee-tinymce
 */

include __DIR__ . '/vendor/autoload.php';
use Doubleedesign\DoubleeTinymce\PluginEntrypoint;

new PluginEntrypoint();

// Use this for testing in the classic editor without needing to install the plugin
add_filter('use_block_editor_for_post_type', function($current_status, $post_type) {
	if (in_array($post_type, ['page'])) {
		return true;
	}

	return false;
}, 10, 2);

function activate_doublee_tinymce(): void {
	PluginEntrypoint::activate();
}
function deactivate_doublee_tinymce(): void {
	PluginEntrypoint::deactivate();
}
function uninstall_doublee_tinymce(): void {
	PluginEntrypoint::uninstall();
}
register_activation_hook(__FILE__, 'activate_doublee_tinymce');
register_deactivation_hook(__FILE__, 'deactivate_doublee_tinymce');
register_uninstall_hook(__FILE__, 'uninstall_doublee_tinymce');
