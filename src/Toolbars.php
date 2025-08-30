<?php
namespace Doubleedesign\DoubleeTinymce;

/**
 * Class Toolbars
 *
 * The class that makes the core customisations to the TinyMCE toolbars using WordPress hooks.
 */
class Toolbars {
    public function __construct() {
        add_filter('tiny_mce_before_init', [$this, 'init_settings'], 10, 1);

        add_filter('mce_buttons', [$this, 'set_default_top_row'], 5, 1);
        add_filter('mce_buttons_2', [$this, 'set_default_second_row'], 5, 1);
        add_filter('mce_buttons_3', [$this, 'set_default_third_row'], 5, 1);
        add_filter('mce_buttons_4', [$this, 'set_default_fourth_row'], 5, 1);

        add_filter('acf/fields/wysiwyg/toolbars', [$this, 'customise_wysiwyg_toolbars_acf'], 15, 1);
    }

    public function init_settings($settings): array {
        $settings['paste_as_text'] = true; // default to "Paste as text"
        $settings['wordpress_adv_hidden'] = false; // keep the "kitchen sink" open

        // Ensure rows 3 and 4 stay open even if row 2 is empty (this plugin's defaults put stuff in row 4)
        if (empty($settings['toolbar2'])) {
            $settings['toolbar2'] = 'separator';
        }

        return $settings;

    }

    public function set_default_top_row(array $buttons): array {
        return (new Toolbar(0, $buttons))->get_buttons();
    }

    public function set_default_second_row(array $buttons): array {
        return (new Toolbar(1, $buttons))->get_buttons();
    }

    public function set_default_third_row(array $buttons): array {
        return (new Toolbar(2, $buttons))->get_buttons();
    }

    public function set_default_fourth_row(array $buttons): array {
        return (new Toolbar(3, $buttons))->get_buttons();
    }

    /**
     * Customise the buttons available in WYSIWYG field editors.
     * Notes: Themes and other plugins may have their own customisations
     *        The "full" toolbar is affected by TinyMCE filters such as tinymce_before_init and mce_buttons.
     *        Yes, the explicit numeric keys are required.
     *
     * @param  $toolbars
     *
     * @return array
     */
    public function customise_wysiwyg_toolbars_acf($toolbars): array {
        $default_top_row = apply_filters('mce_buttons', []);
        $default_second_row = apply_filters('mce_buttons_2', []);

        $toolbars['Minimal'] = array(
            1 => array_diff($default_top_row, ['styleselect', 'hr', 'blockquote']),
            2 => apply_filters('mce_buttons_3', []),
        );

        $toolbars['Basic'] = array(
            1 => array_diff($default_top_row, ['blockquote']),
            2 => array_diff($default_second_row, ['doublee_miniblocks_button_group', 'doublee_miniblocks_pullquote']),
            3 => apply_filters('mce_buttons_3', []),
        );

        return $toolbars;
    }

}
