import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './homePage.module.css'

export const homePageTemplate = () => html`
<div class=${styles["homepage-container"]}>
<p>Welcome to Instill Flow</p>
<p>The new way to place orders!</p>
</div>
`;