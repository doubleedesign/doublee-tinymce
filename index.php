<?php
/**
 * Plugin Name: Double-E TinyMCE
 * Description: Customised configuration and plugins for WordPress/ClassicPress websites by Double-E Design.
 * Requires PHP: 8.4
 * Author: Double-E Design
 * Plugin URI: https://github.com/doubleedesign/doublee-tinymce
 * Author URI: https://www.doubleedesign.com.au
 * Version: 1.1.0
 * Text domain: doublee-tinymce
 */

include __DIR__ . '/vendor/autoload.php';
use Doubleedesign\DoubleeTinymce\PluginEntrypoint;

$is_mu_plugin = false;
if(function_exists('wp_get_mu_plugins')) {
	$is_mu_plugin = array_find(wp_get_mu_plugins(), function($plugin) {
		return str_contains($plugin, 'doublee-tinymce');
	});
}
if (!defined('DOUBLEE_TINYMCE_PLUGIN_URL')) {
	$pluginsPath = $is_mu_plugin ? 'mu-plugins' : 'plugins';
	define('DOUBLEE_TINYMCE_PLUGIN_URL', get_site_url() . "/wp-content/$pluginsPath/doublee-tinymce/src");
}

new PluginEntrypoint();
