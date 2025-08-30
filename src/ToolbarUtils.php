<?php

namespace Doubleedesign\DoubleeTinymce;

/**
 * Class ToolbarUtils
 *
 * Utility functions for getting information about the current toolbar configuration.
 */
class ToolbarUtils {
    private static array $default_rows = array(
        ['removeformat', 'bold', 'italic', 'strikethrough', 'alignleft', 'aligncenter', 'alignright', 'bullist', 'numlist', 'hr', 'blockquote', 'charmap', 'link'],
        [],
        ['undo', 'redo', 'pastetext', 'wp_help'], // this needs to be 3 not 4 by default, or else ACF fields will not show it in "Full" mode out of the box as we want it to
        []
    );

    /**
     * Get the default toolbar rows.
     * Used by the individual Toolbar handlers to deduplicate buttons across rows.
     *
     * @return array
     */
    public static function get_default_rows(): array {
        return self::$default_rows;
    }
}
