<?php
/**
 * Single template: /projects/{slug}/
 * Port to: apps/web/src/pages/projects/[slug].astro   (STEP 4)
 */
get_header();
the_post();

$client      = get_field( 'client' );
$role        = get_field( 'role' );
$summary     = get_field( 'summary' );
$project_url = get_field( 'project_url' );
$repo_url    = get_field( 'repo_url' );
$completed   = get_field( 'completed_on' );
$stack       = get_field( 'stack' );       // repeater -> array of ['name' => ..]
$highlights  = get_field( 'highlights' );  // repeater -> array of ['value' => .., 'label' => ..]
$services    = get_field( 'services' );    // STRETCH A: array of WP_Post
$hero        = get_field( 'hero_image' );  // STRETCH B: image array
?>

<main class="container">
  <a class="back" href="<?php echo get_post_type_archive_link( 'project' ); ?>">&larr; All projects</a>

  <?php if ( $hero ) : ?>
    <img class="hero" src="<?php echo esc_url( $hero['sizes']['large'] ); ?>" alt="<?php echo esc_attr( $hero['alt'] ); ?>">
  <?php endif; ?>

  <h1><?php the_title(); ?></h1>
  <div class="meta">
    <span class="pill"><?php echo esc_html( $client ); ?></span>
    <span><?php echo esc_html( $role ); ?></span>
    <span><?php echo date_i18n( 'F Y', strtotime( $completed ) ); ?></span>
    <?php if ( $project_url ) : ?>
      <a href="<?php echo esc_url( $project_url ); ?>" target="_blank" rel="noopener">Visit site &nearr;</a>
    <?php endif; ?>
    <?php if ( $repo_url ) : ?>
      <a href="<?php echo esc_url( $repo_url ); ?>" target="_blank" rel="noopener">Code &nearr;</a>
    <?php endif; ?>
  </div>

  <p class="lede"><?php echo esc_html( $summary ); ?></p>

  <?php if ( $stack ) : ?>
    <ul class="pills">
      <?php foreach ( $stack as $s ) : ?>
        <li class="pill ghost"><?php echo esc_html( $s['name'] ); ?></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <?php if ( $highlights ) : ?>
    <div class="stats">
      <?php foreach ( $highlights as $h ) : ?>
        <div class="stat">
          <strong><?php echo esc_html( $h['value'] ); ?></strong>
          <span><?php echo esc_html( $h['label'] ); ?></span>
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
    <?php the_content(); // STRETCH C: the 'body' WYSIWYG ?>
  </div>
</main>

<?php get_footer();
