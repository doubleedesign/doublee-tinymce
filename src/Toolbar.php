<?php
namespace Doubleedesign\DoubleeTinymce;

/**
 * Class Toolbar
 *
 * Creates an object from a given array button names for a given editor row,
 * and handles processing of it including deduplication and filtering.
 */
class Toolbar {
    private array $buttons;
    private int $row_index;
    private array $always_remove = [
        'formatselect', // the standard paragraph/heading selector, which we replace this with a custom format selector
        'forecolor',
        'fullscreen',
        'wp_more',
        'alignjustify',
        'indent',
        'outdent',
        'underline',
        'wp_adv'
    ];

    public function __construct(int $row_index, ?array $buttons = []) {
        $this->always_remove = apply_filters('doublee_tinymce_always_remove_buttons', $this->always_remove);
        $this->buttons = !empty($buttons) ? $buttons : ToolbarUtils::get_default_rows()[$row_index];
        $this->row_index = $row_index;

        $this->deduplicate()->merge()->filter();
    }

    /**
     * Remove buttons that are already present in other default rows, and ensure there are no duplicates within this row.
     *
     * @return $this
     */
    protected function deduplicate(): static {
        $rows = ToolbarUtils::get_default_rows();
        unset($rows[$this->row_index]);
        $other_buttons = array_merge(...$rows);

        $this->buttons = array_unique(
            array_filter($this->buttons, fn($button) => !in_array($button, $other_buttons))
        );

        return $this;
    }

    /**
     * Merge the provided buttons with the default buttons for this row.
     *
     * @return $this
     */
    protected function merge(): static {
        $this->buttons = array_unique(array_merge(
            ToolbarUtils::get_default_rows()[$this->row_index],
            $this->buttons
        ));

        return $this;
    }

    /**
     * Filter out buttons that should always be removed.
     *
     * @return $this
     */
    protected function filter(): static {
        $this->buttons = array_filter($this->buttons, fn($button) => !in_array($button, $this->always_remove));

        return $this;
    }

    /**
     * Get the final array of buttons.
     *
     * @return array
     */
    public function get_buttons(): array {
        return array_values($this->buttons);
    }
}
