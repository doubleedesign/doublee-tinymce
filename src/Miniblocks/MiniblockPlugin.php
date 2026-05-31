<?php
namespace Doubleedesign\DoubleeTinymce;
use DOMDocument;
use DOMXPath;

abstract class MiniblockPlugin {
    protected string $name;

    /**
     * @param  $name  - alloneword name of the plugin; the accompanying JS file should match this name with .dist.js suffix
     */
    public function __construct($name) {
        $this->name = $name;
        add_filter('mce_external_plugins', [$this, 'register_plugin'], 1, 1);
        add_filter('mce_buttons_2', [$this, 'register_button'], 5);
        add_filter('the_content', [$this, 'filter_out_miniblock_attributes_when_rendering_html'], 20);
	    add_filter('tiny_mce_before_init', [$this, 'keep_spans_in_generated_html']);
    }

    public function register_plugin(array $plugins): array {
        $currentDir = plugin_dir_url(__FILE__);
        $pluginDir = dirname($currentDir, 2);

        $plugins["doublee_miniblocks_{$this->name}"] = $pluginDir . '/dist/' . $this->name . '.dist.js';

        return $plugins;
    }

    public function register_button(array $buttons): array {
        array_push($buttons, "doublee_miniblocks_{$this->name}");

        return $buttons;
    }

    /**
     * The miniblocks plugin JS adds some data attributes to the HTML to allow for its editing features,
     * but we don't want those rendered on the front-end.
     *
     * @param  $content
     *
     * @return string
     */
    public function filter_out_miniblock_attributes_when_rendering_html($content): string {
        $attributes = ['contenteditable', 'data-quote', 'data-citation', 'data-content'];
        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="UTF-8">' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NOERROR);

        $xpath = new DOMXPath($dom);
        foreach ($attributes as $attr) {
            foreach ($xpath->query('//*[@' . $attr . ']') as $node) {
                $node->removeAttribute($attr);
            }
        }

        $output = $dom->saveHTML();

        return str_replace('<?xml encoding="UTF-8">', '', $output);
    }

	public function keep_spans_in_generated_html($tinymce_settings) {
		$existing = $settings['extended_valid_elements'] ?? '';
		$settings['extended_valid_elements'] = $existing
			? $existing . ',span,span[*]'
			: 'span,span[*]';

		return $settings;
	}
}
