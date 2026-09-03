<?php
/**
 * Card partial used by the archive.
 * Port to: apps/web/src/components/CaseStudyCard.astro
 */
$client = get_field( 'client' );
$hero   = get_field( 'hero_image' ); // STRETCH
?>
<a class="card" href="<?php the_permalink(); ?>">
  <?php if ( $hero ) : ?>
    <img src="<?php echo esc_url( $hero['sizes']['medium'] ); ?>" alt="<?php echo esc_attr( $hero['alt'] ); ?>">
  <?php endif; ?>
  <span class="pill"><?php echo esc_html( $client ); ?></span>
  <h3><?php the_title(); ?></h3>
  <p><?php echo esc_html( get_field( 'summary' ) ); ?></p>
</a>
