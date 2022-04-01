import { PlElement, html, css } from "polylib";
import '@plcmp/pl-repeat';
import '@plcmp/pl-icon';

import { addOverlay, removeOverlay } from "@plcmp/utils";

import "../components/pl-app-side-list.js";

class PlAppSide extends PlElement {
	static get properties() {
		return {
			opened: { type: Boolean, reflectToAttribute: true, observer: 'openedObserver', value: false },
			items: { type: Array, value: () => ([]) },
			selected: { type: Object, value: null, observer: '_selectedObserver' },
			_selectedItemsStack: { type: Array, value: () => ([]), observer: '_selectedItemsStackObserver' },
		};
	}

	static get css() {
		return css`
			:host {
				display: flex;
				flex-direction: column;
				box-sizing: border-box;
				width: var(--menu-width);
				position: absolute;
				user-select: none;
				height: 100%;
				background: var(--menu-background-color);
				transition: all 0.3s ease-in-out;
				--menu-width: 64px;
				--menu-opened-width: 280px;
				will-change: width;
			}

			:host([opened]) {
				width: var(--menu-opened-width);
				transition: all 0.3s ease-in-out;
			}

			.logo {
				display: flex;
				flex-direction: column;
				padding: 8px 16px;
			}

			.menuItems {
				position: relative;
				height: 100%;
				color: white;
				display: flex;
				flex-direction: column;
				color: white;
				overflow: hidden;
				gap: 8px;
			}

			.submenu {
				display: flex;
				position: absolute;
				top: 0;
				right: 0;
				width:0;
				box-sizing: border-box;
				height:100%;
			}

			.submenu-item { 
				position: relative;
				height: 100%; 
				background: #fff; 
				min-width: var(--menu-opened-width);
				animation: slide 0.3s;
			}

			@keyframes slide { 
				0% { transform: translateX(-100%); opacity: 0;} 
				100% { transform: translateX(0); opacity: 1;}   
			}

			:host .submenu-item:nth-child(odd) {
				border-left: 1px solid #E9EDF0;
				filter: drop-shadow(0px 8px 32px rgba(0, 0, 0, 0.12));
			}
    	`;
	}

	static get template() {
		return html`
			<div class="logo">
				<slot name="logo"></slot>
				<slot name="toggle"></slot>
			</div>
			<div class="submenu">
				<pl-repeat items="[[_selectedItemsStack]]" as="subitem" >
					<template>
						<div class="submenu-item">
							<pl-app-side-list opened$=[[opened]] parent="[[subitem.parent]]" items="[[subitem.items]]"  on-menu-click="[[onMenuClick]]"></pl-app-side-list>
						</div>
					</template>
				</pl-repeat>
			</div>
			<div class="menuItems">
				<pl-app-side-list opened$=[[opened]] variant="main" items="[[_computeItems(items, items.0)]]" on-menu-click="[[onMenuClick]]"></pl-app-side-list>
			</div>
			
			<div class="logo">
				<slot name="bottom"></slot>
			</div>
    	`;
	}

	constructor(){
		super();
		this._close = e => {
            let path = e.composedPath();
            if (!path.includes(this)) {
                e.preventDefault();
				this.close();
            }
        }
	}
	

	openedObserver(val) {
		if (val) {
			addEventListener('click', this._close, { capture: true, once: true });
			addOverlay(this);
		} else if(this._selectedItemsStack.length == 0){
			setTimeout(() => {
				removeOverlay(this);
			}, 300);
		}
	}

	_computeItems(items, parent) {
		return items.filter(x => x.pid == parent.id).map(item => ({
			...item,
			hasChildren: this.items.some(element => element.pid === item.id),
		}));
	}

	onMenuClick(event) {
		this.selected = event.detail;
	}

	_selectedItemsStackObserver(items) {
		if(items.length > 0) {
			addOverlay(this);
		} else {
			removeOverlay(this);
		}
		addEventListener('click', this._close, { capture: true, once: true });
	}

	_selectedObserver(value) {
		if (!value) {
            return;
        }
        let found = false;
        for (let i = this._selectedItemsStack.length; i--;) {
            const item = this._selectedItemsStack[i];
            if (item.items.some(item => item.id === value.id)) {
                this.splice('_selectedItemsStack', i + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            this.splice('_selectedItemsStack', 0, this._selectedItemsStack.length);
        }

        const items = this._computeItems(this.items, value);
        if (items && items.length > 0) {
            this.push('_selectedItemsStack', { 
				parent: value, 
				items
			});
        }

        this.dispatchEvent(new CustomEvent('menuItemSelected', { detail: value, bubbles: true, composed: true }));
	}

	close(){
		this.splice('_selectedItemsStack', 0, this._selectedItemsStack.length);
		this.selected = null;
		this.opened = false;
	}
}


customElements.define("pl-app-side", PlAppSide);