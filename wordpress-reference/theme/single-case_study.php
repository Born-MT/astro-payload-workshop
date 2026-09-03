<?php
/**
 * Single template: /case-studies/{slug}/
 * Port to: apps/web/src/pages/case-studies/[slug].astro
 */
get_header();
the_post();

$client      = get_field( 'client' );
$summary     = get_field( 'summary' );
$project_url = get_field( 'project_url' );
$completed   = get_field( 'completed_on' );
$results     = get_field( 'results' );     // repeater -> array of ['value' => .., 'label' => ..]
$services    = get_field( 'services' );    // STRETCH: array of WP_Post
$hero        = get_field( 'hero_image' );  // STRETCH: image array
?>

<main class="container">
  <a class="back" href="<?php echo get_post_type_archive_link( 'case_study' ); ?>">&larr; All case studies</a>

  <?php if ( $hero ) : ?>
    <img class="hero" src="<?php echo esc_url( $hero['sizes']['large'] ); ?>" alt="<?php echo esc_attr( $hero['alt'] ); ?>">
  <?php endif; ?>

  <h1><?php the_title(); ?></h1>
  <div class="meta">
    <span class="pill"><?php echo esc_html( $client ); ?></span>
    <span><?php echo date_i18n( 'F Y', strtotime( $completed ) ); ?></span>
    <?php if ( $project_url ) : ?>
      <a href="<?php echo esc_url( $project_url ); ?>" target="_blank" rel="noopener">Visit site &nearr;</a>
    <?php endif; ?>
  </div>

  <p class="lede"><?php echo esc_html( $summary ); ?></p>

  <?php if ( $results ) : ?>
    <div class="stats">
      <?php foreach ( $results as $r ) : ?>
        <div class="stat">
          <strong><?php echo esc_html( $r['value'] ); ?></strong>
          <span><?php echo esc_html( $r['label'] ); ?></span>
        </div>
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <?php if ( $services ) : ?>
    <h2>Services</h2>
    <ul class="pills">
      <?php foreach ( $services as $s ) : ?>
        <li><a class="pill ghost" href="<?php echo get_permalink( $s ); ?>"><?php echo esc_html( $s->post_title ); ?></a></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <div class="prose">
    <?php the_content(); // STRETCH: the 'body' WYSIWYG ?>
  </div>
</main>

<?php get_footer();
