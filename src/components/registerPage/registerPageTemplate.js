import { html } from "lit-html";
import styles from './registerPage.module.css'

export const registerPageTemplate = (submitHandler) => html`
 <div class=${styles['container']}>
        <form @submit=${submitHandler} class=${styles['form']}>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="username">Email</label>
            <input type="text" name="email" />
          </div>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="password">Password</label>
            <input type="password" name="password" />
          </div>
          <div class=${styles['input-container']}>
            <label class=${styles['label']} for="repeatPassword">Repeat Password</label>
            <input type="password" name="repeatPassword" />
          </div>
          <button class=${styles['submit-btn']}>Register</button>
        </form>
      </div>`