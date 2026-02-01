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
