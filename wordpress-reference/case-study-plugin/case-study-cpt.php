<?php
/**
 * Plugin Name: Webee Case Studies
 * Description: Registers the "Case Study" custom post type. (Reference only — port me to Payload.)
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'init', function () {
    register_post_type( 'case_study', [
        'labels' => [
            'name'          => 'Case Studies',
            'singular_name' => 'Case Study',
            'add_new_item'  => 'Add New Case Study',
        ],
        'public'       => true,
        'has_archive'  => 'case-studies',
        'rewrite'      => [ 'slug' => 'case-studies' ],
        'menu_icon'    => 'dashicons-portfolio',
        'supports'     => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
        'show_in_rest' => true,
        'rest_base'    => 'case-studies',
    ] );
} );

/**
 * Auto-slug: same as core behaviour, but shown here because Payload does NOT
 * do this for you — you write a small hook (see Services.ts for the pattern).
 */
add_filter( 'wp_insert_post_data', function ( $data ) {
    if ( $data['post_type'] === 'case_study' && empty( $data['post_name'] ) ) {
        $data['post_name'] = sanitize_title( $data['post_title'] );
    }
    return $data;
} );
