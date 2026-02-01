<?php
namespace Doubleedesign\DoubleeTinymce;

class ButtonGroupPlugin extends MiniblockPlugin {
    private string $default_dynamic_acf_field_group_prefix = 'doublee_tinymce_dynamic_field_group';

    public function __construct() {
        if (!function_exists('acf_add_local_field_group')) {
            error_log('ACF is not active. The Button Group miniblock will not be registered.');

            return;
        }

        parent::__construct('buttongroup');
        add_action('wp_ajax_get_button_group_modal_content', [$this, 'get_button_group_modal_content']);
        add_action('admin_head', 'acf_form_head');

	    add_action('wp_ajax_generate_button_html', [$this, 'generate_button_html']);
    }

    /**
     * Generate the HTML for an ACF button group repeater field to be used in the modal dialog for selecting links and other button options,
     * to be called via AJAX for rendering on the JS side.
     * Note: The data should not and is not intended to be saved in post meta as usual,
     *       we are using this purely to leverage the ACF form UI in the modal.
     *       The data is to be handled on the JS side to insert the button group into the content as HTML.
     *
     * @return void
     */
    public function get_button_group_modal_content(): void {
        if (!wp_verify_nonce($_POST['nonce'], 'doublee_tinymce_ajax_nonce')) {
            wp_die('Security check failed');
        }

        try {
            $postData = json_decode(stripslashes($_POST['body']), true);
            $field_group = $this->create_acf_button_group($postData['object_type'], $postData['id']);

            // Temporarily register the field group in the ACF store to allow rendering the form
            acf_add_local_field_group($field_group);

            ob_start();
            acf_form(array(
                'id'                      => 'comet-dynamic-acf-button-group-form',
                'field_groups'            => array($field_group['key']),
                'form'                    => false,
                'return'                  => false,
                'html_before_fields'      => "<p>Add a group of button-style links to your content block.</p>",
                'html_after_fields'       => '',
                'submit_value'            => '',
                'updated_message'         => 'Button group updated',
            ));
            $form = ob_get_clean();

            wp_send_json_success(array(
                'acf_field_group_key'           => $field_group['key'],
                'acf_button_group_repeater_key' => $field_group['fields'][0]['key'],
                'form_html'                     => $form,
            ));

            // Remove the field group from the ACF store because we're not saving data in the usual way and don't need it there
            acf_remove_local_field_group($field_group['key']);
        }
        catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage(),
            ));
        }

    }

    /**
     * Dynamically create a button group ACF field group for the given object.
     * Note: As long as this is not called with acf_add_local_field_group on acf/include_fields or similar,
     *       the field group will not be registered as usual and thus not show up as a post meta box or save data to post meta.
     *       This is intentional, as we just want it for the UI in the modal dialog, which will handle the data on the JS side.
     *       For this reason, we don't need to worry about deleting unused field groups later.
     *
     * @param  string  $object_type
     * @param  string|int  $object_id
     *
     * @return array - The ACF field group array
     */
    private function create_acf_button_group(string $object_type, string|int $object_id): array {
        $innerKey = $this->generate_random_key();
        $template = self::create_button_group_repeater("doublee_dynamic_$innerKey", true);

        return array(
            'key'    => $this->generate_field_group_key($this->default_dynamic_acf_field_group_prefix),
            'title'  => 'Button group',
            'fields' => array($template),
            // TODO: Ensure taxonomy terms and other non-post locations (options fields?) are handled here too
            'location' => array(
                array(
                    array(
                        'param'    => $object_type,
                        'operator' => '==',
                        'value'    => $object_id,
                    ),
                ),
            )
        );
    }

    private static function create_button_group_repeater(string $parent_key, bool $required = false): array {
        return array(
            'key'               => "field__{$parent_key}__button-group",
            'label'             => 'Buttons',
            'name'              => 'buttons',
            'type'              => 'repeater',
            'min'               => 1,
            'max'               => 3,
            'layout'            => 'table',
            'button_label'      => 'Add button',
            'repeatable'        => true,
            'sub_fields'        => array(
                array(
                    'key'               => "field__{$parent_key}__button-group__button",
                    'label'             => 'Link',
                    'name'              => 'link',
                    'type'              => 'link',
                    'return_format'     => 'array',
                    'repeatable'        => true,
                    'required'          => $required,
                    'wrapper'           => array(
                        'width' => 70,
                    ),
                ),
                array(
                    'key'           => "field__{$parent_key}__button-group__button__style",
                    'label'         => 'Style',
                    'name'          => 'style',
                    'type'          => 'button_group',
                    'choices'       => array(
                        'default'     => 'Solid',
                        'isOutline'   => 'Outline',
                    ),
                    'wrapper' => array(
                        'width' => 30,
                    ),
                )
            ),
        );
    }

    private function generate_field_group_key(string $prefix): string {
        do {
            $key = $this->generate_random_key();
        }
        while (acf_get_field_group("{$prefix}__{$key}") === null);

        return "{$prefix}__{$key}";
    }

    private function generate_random_key(int $length = 10): string {
        try {
            // Each byte converts to two hexadecimal characters, so request half the length
            $bytes = random_bytes(ceil($length / 2));

            return substr(bin2hex($bytes), 0, $length);
        }
        catch (\Exception $e) {
            if (function_exists('dump')) {
                dump($e->getMessage());
            }
            else {
                error_log($e->getMessage());
            }
        }

        // Fall back to returning the current timestamp if random_bytes fails
        return (string)time();
    }


	public function generate_button_html(): void {
		if (!wp_verify_nonce($_POST['nonce'], 'doublee_tinymce_ajax_nonce')) {
			wp_die('Security check failed');
		}

		try {
			$data = json_decode(stripslashes($_POST['body']), true);

			if(class_exists('Doubleedesign\Comet\Core\Button')) {
				$button = new \Doubleedesign\Comet\Core\Button([
					'href' => $data['url'] ?? '#',
					'isOutline' => isset($data['style']) && $data['style'] === 'outline',
					'target' => isset($data['target']) && $data['target'] === '_blank' ? '_blank' : '',
				],$data['label'] ?? 'Untitled Button');

				ob_start();
				$button->render();
				$html = ob_get_clean();
			}
			else if(class_exists('DOMElement' && class_exists('DOMDocument'))) {
				$button = new \DOMElement('a');
				$button->setAttribute('class', 'button');
				$button->setAttribute('href', $data['url'] ?? '#');
				if(isset($data['style']) && $data['style'] === 'outline') {
					$button->setAttribute('data-style', 'outline');
				}
				if(isset($data['target']) && $data['target'] === '_blank') {
					$button->setAttribute('target', '_blank');
				}
				$button->nodeValue = $data['label'] ?? 'Untitled Button';

				$tempDoc = new \DOMDocument();
				$importedButton = $tempDoc->importNode($button, true);
				$tempDoc->appendChild($importedButton);
				$html = $tempDoc->saveHTML($importedButton);
			}
			else {
				throw new \Exception('Unable to generate button HTML: required PHP classes are missing.');
			}

			wp_send_json_success(array(
				'html' => trim($html)
			));
		}
		catch (\Exception $e) {
			wp_send_json_error(array(
				'message' => $e->getMessage(),
			));
		}
	}
}
