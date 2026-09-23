<?php
/**
 * Template Name: About
 * Reads the Profile options page. There is no post behind this: one screen, one set of values.
 * Port to: apps/web/src/pages/about.astro   (STEP 5)
 *
 * WordPress analogy for the data: get_field( 'x', 'option' ) reads the ACF options page.
 * Payload analogy: GET /api/globals/profile — a Global is an options page with a schema.
 */
get_header();

$name     = get_field( 'name', 'option' );
$headline = get_field( 'headline', 'option' );
$bio      = get_field( 'bio', 'option' );
$email    = get_field( 'email', 'option' );
$location = get_field( 'location', 'option' );
$links    = get_field( 'links', 'option' ); // repeater -> array of ['label' => .., 'url' => ..]
?>

<main class="container">
  <h1><?php echo esc_html( $name ); ?></h1>
  <p class="lede"><?php echo esc_html( $headline ); ?></p>

  <div class="meta">
    <?php if ( $location ) : ?><span><?php echo esc_html( $location ); ?></span><?php endif; ?>
    <?php if ( $email ) : ?><a href="mailto:<?php echo esc_attr( $email ); ?>"><?php echo esc_html( $email ); ?></a><?php endif; ?>
  </div>

  <div class="prose">
    <?php echo wpautop( esc_html( $bio ) ); ?>
  </div>

  <?php if ( $links ) : ?>
    <ul class="pills">
      <?php foreach ( $links as $l ) : ?>
        <li><a class="pill ghost" href="<?php echo esc_url( $l['url'] ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $l['label'] ); ?></a></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</main>

<?php get_footer();
