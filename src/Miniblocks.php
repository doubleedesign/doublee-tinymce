<?php
namespace Doubleedesign\DoubleeTinymce;

class Miniblocks {
    public function __construct() {
        new CalloutPlugin();
        new PullquotePlugin();
        if (class_exists('acf_pro')) {
            new ButtonGroupPlugin();
        }

        add_action('admin_enqueue_scripts', [$this, 'register_miniblocks_shared_admin_css'], 20);
        add_action('admin_enqueue_scripts', [$this, 'make_data_available_to_tinymce_js'], 20);
    }

    public function register_miniblocks_shared_admin_css(): void {
        $currentDir = plugin_dir_url(__FILE__);
        $pluginDir = dirname($currentDir, 1);
        wp_enqueue_style('comet-miniblocks-admin-css', $pluginDir . '/src/Miniblocks/common.css', array(), null);
    }

    public function make_data_available_to_tinymce_js(): void {
        try {
            wp_localize_script('wp-tinymce', 'doublee_tinymce', array(
                'ajaxUrl'          => admin_url('admin-ajax.php'),
                'nonce'            => wp_create_nonce('doublee_tinymce_ajax_nonce'),
                'palette'          => apply_filters('doublee_tinymce_theme_colours', []),
				'defaults'         => apply_filters('doublee_tinymce_miniblock_defaults', []),
                'context'          => [
                    // TODO: Handle taxonomy term types here too
                    'object_type' => get_post_type(),
                    'id'          => get_the_id(),
                ]
            ));
        }
        catch (\Exception $e) {
            if (function_exists('dump')) {
                dump($e->getMessage());
            }
            else {
                error_log($e->getMessage());
            }
        }
    }

}
