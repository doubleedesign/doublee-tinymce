<?php
namespace Doubleedesign\DoubleeTinymce;

class PluginEntrypoint {
    private static string $version = '0.0.1';

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

    public static function activate() {
        // Activation logic here
    }

    public static function deactivate() {
        // Deactivation logic here
    }

    public static function uninstall() {
        // Uninstallation logic here
    }
}
