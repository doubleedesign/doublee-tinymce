<?php
use Doubleedesign\DoubleeTinymce\Utils;

describe('Utils', function() {

    describe('insert_at_index', function() {
        it('inserts at the start', function() {
            $array = ['b', 'c'];
            Utils::insert_at_index($array, 0, 'a');

            expect($array)->toEqual(['a', 'b', 'c']);
        });

        it('inserts at the end', function() {
            $array = ['a', 'b'];
            Utils::insert_at_index($array, 2, 'c');

            expect($array)->toEqual(['a', 'b', 'c']);
        });

        it('inserts in the middle', function() {
            $array = ['a', 'c'];
            Utils::insert_at_index($array, 1, 'b');

            expect($array)->toEqual(['a', 'b', 'c']);
        });
    });

    describe('insert_after_value', function() {
        it('inserts after existing value in the middle', function() {
            $array = ['a', 'b', 'c'];
            Utils::insert_after_value($array, 'x', 'b');

            expect($array)->toEqual(['a', 'b', 'x', 'c']);
        });

        it('inserts after existing value at the end', function() {
            $array = ['a', 'b', 'c'];
            Utils::insert_after_value($array, 'x', 'c');

            expect($array)->toEqual(['a', 'b', 'c', 'x']);
        });

        it('inserts at the end if value not found', function() {
            $array = ['a', 'b', 'c'];
            Utils::insert_after_value($array, 'x', 'y');

            expect($array)->toEqual(['a', 'b', 'c', 'x']);
        });
    });

    describe('insert_before_value', function() {
        it('inserts before existing value', function() {
            $array = ['a', 'b', 'c'];
            Utils::insert_before_value($array, 'b', 'x');

            expect($array)->toEqual(['a', 'x', 'b', 'c']);
        });

        it('inserts at the start if value not found', function() {
            $array = ['a', 'b', 'c'];
            Utils::insert_before_value($array, 'y', 'x');

            expect($array)->toEqual(['x', 'a', 'b', 'c']);
        });
    });
});
