<?php

namespace Doubleedesign\DoubleeTinymce;

class Utils {

    public static function insert_at_index(array &$array, int $index, $value): void {
        $start = array_slice($array, 0, $index);
        $end = array_slice($array, $index);

        $array = array_merge($start, is_array($value) ? $value : [$value], $end);
    }

    public static function insert_after_value(array &$array, $new_value, $after_value): void {
        $index = array_search($after_value, $array);
        if (!$index) {
            array_push($array, $new_value);
        }
        else {
            self::insert_at_index($array, $index + 1, $new_value);
        }
    }

    public static function insert_before_value(array &$array, $before_value, $value): void {
        $index = array_search($before_value, $array);
        if (!$index) {
            array_unshift($array, $value);
        }
        else {
            self::insert_at_index($array, $index, $value);
        }
    }
}
