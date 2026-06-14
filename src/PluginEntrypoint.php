<?php
namespace Doubleedesign\DoubleeTinymce;

class PluginEntrypoint {
    private static string $version = '1.1.0';

    public function __construct() {
        new Styleselect();
		new Toolbars();
		new EditorUI();
		new Tables();
		new Miniblocks();
    }

    public static function get_version(): string {
        return self::$version;
    }
}
