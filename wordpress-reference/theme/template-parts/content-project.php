<?php
/**
 * Card partial used by the archive.
 * Port to: apps/web/src/components/ProjectCard.astro   (STEP 3)
 */
$client = get_field( 'client' );
$role   = get_field( 'role' );
$hero   = get_field( 'hero_image' ); // STRETCH B
?>
<a class="card" href="<?php the_permalink(); ?>">
  <?php if ( $hero ) : ?>
    <img src="<?php echo esc_url( $hero['sizes']['medium'] ); ?>" alt="<?php echo esc_attr( $hero['alt'] ); ?>">
  <?php endif; ?>
  <span class="pill"><?php echo esc_html( $client ); ?></span>
  <h3><?php the_title(); ?></h3>
  <p><?php echo esc_html( get_field( 'summary' ) ); ?></p>
  <small><?php echo esc_html( $role ); ?></small>
</a>
