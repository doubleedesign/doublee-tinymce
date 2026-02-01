<?php

namespace Doubleedesign\DoubleeTinymce;

class Styleselect {

    public function __construct() {
        add_filter('mce_buttons', [$this, 'add_styleselect'], 20, 1);
        add_filter('tiny_mce_before_init', [$this, 'populate_styleselect'], 10, 1);
    }

    /**
     * Add custom formats menu to the start of the first toolbar if it's not already there
     *
     * @param  $buttons
     *
     * @return array
     */
    public function add_styleselect($buttons): array {
        if (!in_array('styleselect', $buttons)) {
            Utils::insert_at_index($buttons, 0, 'styleselect');
        }

        return $buttons;
    }

    /**
     * Populate custom formats menu
     * Notes: - 'selector' for block-level element that format is applied to; 'inline' to add wrapping tag e.g.'span'
     *        - Using 'attributes' to apply the classes instead of 'class' ensures previous classes are replaced rather than added to
     *        - 'styles' are inline styles that are applied to the items in the menu, not the output; options are pretty limited but enough to add things like colours
     *          (further styling customisation to the menu may be done in the admin stylesheet)
     *
     * @param  $settings
     *
     * @return array
     */
    public function populate_styleselect($settings): array {
        $style_formats = array(
			array(
				'title' => 'Paragraph',
				'items' => array(
			        array(
				        'title'   => 'Normal paragraph',
				        'block'   => 'p',
				        'classes' => ''
			        ),
		            array(
		                'title'   => 'Lead paragraph',
		                'block'   => 'p',
		                'classes' => 'is-style-lead'
		            )
				)
			),
            // Because we remove the standard format selector in favour of this custom one, we need to add standard headings too
            array(
                'title' => 'Heading',
                'items' => array(
                    array(
                        'title'   => 'H2',
                        'block'   => 'h2',
                        'classes' => ''
                    ),
                    array(
                        'title'   => 'H3',
                        'block'   => 'h3',
                        'classes' => ''
                    ),
                    array(
                        'title'   => 'H4',
                        'block'   => 'h4',
                        'classes' => ''
                    ),
                )
            ),
            array(
                'title' => 'Small style heading',
                'items' => array(
                    array(
                        'title'   => 'H2',
                        'block'   => 'h2',
                        'classes' => 'is-style-small'
                    ),
                    array(
                        'title'   => 'H3',
                        'block'   => 'h3',
                        'classes' => 'is-style-small'
                    ),
                    array(
                        'title'   => 'H4',
                        'block'   => 'h4',
                        'classes' => 'is-style-small'
                    ),
                )
            ),
            array(
                'title' => 'Accent style heading',
                'items' => array(
                    array(
                        'title'   => 'H2',
                        'block'   => 'h2',
                        'classes' => 'is-style-accent'
                    ),
                    array(
                        'title'   => 'H3',
                        'block'   => 'h3',
                        'classes' => 'is-style-accent'
                    ),
                    array(
                        'title'   => 'H4',
                        'block'   => 'h4',
                        'classes' => 'is-style-accent'
                    ),
                )
            )
        );

        $style_formats = apply_filters('doublee_tinymce_styleselect_formats', $style_formats);

        $settings['style_formats'] = json_encode($style_formats);
        unset($settings['preview_styles']);

        return $settings;
    }
}
