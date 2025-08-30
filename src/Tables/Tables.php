<?php
namespace Doubleedesign\DoubleeTinymce;
use stdClass;

class Tables {

    public function __construct() {
        add_filter('mce_external_plugins', [$this, 'register_plugin'], 1, 1);
        add_filter('mce_buttons_2', [$this, 'register_button'], 10);
        add_filter('tiny_mce_before_init', [$this, 'init_table_settings'], 10, 2);
        add_filter('content_save_pre', [$this, 'cleanup_before_save'], 20);
    }

    public function register_plugin(array $plugins): array {
        $currentDir = plugin_dir_url(__FILE__);
        $pluginDir = dirname($currentDir, 2);

        $plugins['table'] = $pluginDir . '/dist/tables.dist.js';

        return $plugins;
    }

    public function register_button(array $buttons): array {
        array_push($buttons, 'table');

        return $buttons;
    }

    public function init_table_settings($settings) {
        // Remove the table toolbar because it doesn't play nicely with WordPress out of the box
        $settings['table_toolbar'] = '';

        // Clear default inline styles and attributes
        $empty_object = new stdClass();
        $settings['table_default_attributes'] = json_encode($empty_object);
        $settings['table_default_styles'] = json_encode($empty_object);

        // Disable styling and appearance settings in modal
        $settings['table_advtab'] = false;
        $settings['table_appearance_options'] = false;
        $settings['table_cell_advtab'] = false;
        $settings['table_row_advtab'] = false;

        // Other settings
        $settings['table_resize_bars'] = false;
        $settings['table_grid'] = true;
        $settings['table_style_by_css'] = true;
        $settings['table_responsive_width'] = true;
        $settings['object_resizing'] = false;

        return $settings;
    }

    /**
     * Fixes weirdness resulting from wpautop and formatting clean up not built for tables.
     * Pulled from 10up's MCE Table Buttons plugin.
     *
     * @param  string  $content  Editor content before WordPress massaging.
     *
     * @return string Editor content before WordPress massaging
     */
    public static function cleanup_before_save($content): string {
        if (str_contains($content, '<table')) {
            // paragraphed content inside of a td requires first paragraph to have extra line breaks (or else autop breaks).
            $content = preg_replace("/<td([^>]*)>(.+\r?\n\r?\n)/m", "<td$1>\n\n$2", $content);

            // make sure there's space around the table.
            if (str_ends_with($content, '</table>')) {
                $content .= "\n<br />";
            }
        }

        return $content;
    }
}
