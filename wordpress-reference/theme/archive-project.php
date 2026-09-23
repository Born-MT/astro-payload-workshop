<?php
/**
 * Archive template: /projects/
 * Port to: apps/web/src/pages/projects/index.astro   (STEP 3)
 */
get_header(); ?>

<main class="container">
  <h1>Projects</h1>
  <p class="lede">Things I have built, most recent first.</p>

  <?php
  $query = new WP_Query( [
      'post_type'      => 'project',
      'posts_per_page' => 20,
      'meta_key'       => 'completed_on',
      'orderby'        => 'meta_value',
      'order'          => 'DESC',
  ] );

  if ( $query->have_posts() ) : ?>
    <div class="grid">
      <?php while ( $query->have_posts() ) : $query->the_post();
          get_template_part( 'template-parts/content', 'project' );
      endwhile; ?>
    </div>
  <?php else : ?>
    <p class="empty">No projects yet.</p>
  <?php endif;
  wp_reset_postdata(); ?>
</main>

<?php get_footer();
