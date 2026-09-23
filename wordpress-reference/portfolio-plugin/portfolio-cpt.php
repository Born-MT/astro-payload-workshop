<?php
/**
 * Plugin Name: My Portfolio
 * Description: Registers the "Project" custom post type and the Profile options page.
 *              (Reference only — port me to Payload.)
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * STEP 1 — Port this to apps/cms/src/collections/Projects.ts
 */
add_action( 'init', function () {
    register_post_type( 'project', [
        'labels' => [
            'name'          => 'Projects',
            'singular_name' => 'Project',
            'add_new_item'  => 'Add New Project',
        ],
        'public'       => true,
        'has_archive'  => 'projects',
        'rewrite'      => [ 'slug' => 'projects' ],
        'menu_icon'    => 'dashicons-portfolio',
        'supports'     => [ 'title', 'editor', 'thumbnail', 'excerpt' ],
        'show_in_rest' => true,
        'rest_base'    => 'projects',
    ] );
} );

/**
 * Auto-slug: same as core behaviour, but shown here because Payload does NOT
 * do this for you — you write a small hook (see Services.ts for the pattern).
 */
add_filter( 'wp_insert_post_data', function ( $data ) {
    if ( $data['post_type'] === 'project' && empty( $data['post_name'] ) ) {
        $data['post_name'] = sanitize_title( $data['post_title'] );
    }
    return $data;
} );

/**
 * STEP 5 — Port this to apps/cms/src/globals/Profile.ts
 *
 * An ACF options page is a single screen of fields with no list of posts behind it:
 * exactly one "document". In Payload that is a Global, not a Collection.
 */
if ( function_exists( 'acf_add_options_page' ) ) {
    acf_add_options_page( [
        'page_title' => 'Profile',
        'menu_title' => 'Profile',
        'menu_slug'  => 'profile',
        'capability' => 'edit_posts',
    ] );
}
