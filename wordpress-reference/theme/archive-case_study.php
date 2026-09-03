<?php
/**
 * Archive template: /case-studies/
 * Port to: apps/web/src/pages/case-studies/index.astro
 */
get_header(); ?>

<main class="container">
  <h1>Case Studies</h1>
  <p class="lede">Selected work, most recent first.</p>

  <?php
  $query = new WP_Query( [
      'post_type'      => 'case_study',
      'posts_per_page' => 20,
      'meta_key'       => 'completed_on',
      'orderby'        => 'meta_value',
      'order'          => 'DESC',
  ] );

  if ( $query->have_posts() ) : ?>
    <div class="grid">
      <?php while ( $query->have_posts() ) : $query->the_post();
          get_template_part( 'template-parts/content', 'case_study' );
      endwhile; ?>
    </div>
  <?php else : ?>
    <p class="empty">No case studies yet.</p>
  <?php endif;
  wp_reset_postdata(); ?>
</main>

<?php get_footer();
