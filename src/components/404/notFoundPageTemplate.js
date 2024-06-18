import { html } from "lit-html";
import styles from './notFoundPage.module.scss'
export const notFoundPageTemplate = () => html`
<div class=${styles['container']}>
<div class=${styles['not-found_container']}>
    <h1>404</h1> Page Not Found</h1>
</div>
<p>Back to <a href="/">home</a></p>
</div>`