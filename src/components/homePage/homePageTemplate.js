import { html } from "../../../node_modules/lit-html/lit-html.js";
import styles from './homePage.module.scss'

export const homePageTemplate = (completion, progressReport, userData) => {
return html`
<div class=${styles["homepage-container"]}>
 ${userData?.storeName ? html`<p class=${styles["storename"]}>${userData.storeName}</p>` : null}   
${completion < 100 && progressReport ? progressTemplate(completion, progressReport, userData): null}
</div>
`};


const progressTemplate = (completion, progressReport) => html`

<div class="progress-report">

</div>

<div class=${styles["progress-container"]}>
    <p class=${styles["progress-title"]}>Profile ${completion < 100 ? 'incomplete' : 'complete'}</p>
    <div class=${styles["progress-bar"]}>
        <div class=${styles["progress"]} style="width:${completion}%"></div>
        <p class=${styles['progress-value']}>${completion} %</p>
    </div>
</div>
`;