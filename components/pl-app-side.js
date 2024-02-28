import { PlElement, html, css } from "polylib";
import '@plcmp/pl-icon';

import { addOverlay, removeOverlay } from "@plcmp/utils";

import "../components/pl-app-side-list.js";

class PlAppSide extends PlElement {
	static properties = {
		opened: { type: Boolean, reflectToAttribute: true, observer: 'openedObserver', value: false },
		items: { type: Array, value: () => ([]) },
		selected: { type: Object, value: null, observer: '_selectedObserver' },
		_selectedItemsStack: { type: Array, value: () => [], observer: '_selectedItemsStackObserver' },
		manualHide: { type: Boolean, value: false }
	};

	static css = css`
		:host {
			--pl-menu-width: 64px;
			--pl-menu-opened-width: 280px;

			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: var(--pl-menu-width);
			user-select: none;
			height: 100%;
			background: var(--pl-menu-background-color);
			transition: all 0.3s ease-in-out;
			will-change: width;
			position: relative;
		}

		:host([opened]) {
			width: var(--pl-menu-opened-width);
			transition: all 0.3s ease-in-out;
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
			inset-block-start: 0;
			inset-inline-end: 0;
			width:0;
			box-sizing: border-box;
			height:100%;
		}

		.submenu-item { 
			position: relative;
			height: 100%; 
			background: #fff; 
			min-width: var(--pl-menu-opened-width);
			animation: fade 0.3s;
		}

		@keyframes fade { 
			0% { opacity: 0;} 
			100% { opacity: 1;}   
		}

		:host .submenu-item:last-child {
			border-left: 1px solid #E9EDF0;
			filter: drop-shadow(0px 8px 32px rgba(0, 0, 0, 0.12));
		}
	`;

	static template = html`
		<slot name="top"></slot>
		<div class="submenu">
			<template d:repeat="[[_selectedItemsStack]]" d:as="subitem">
				<div class="submenu-item">
					<pl-app-side-list opened$=[[opened]] parent="[[subitem.parent]]" items="[[subitem.items]]"
						on-menu-click="[[onMenuClick]]"></pl-app-side-list>
				</div>
			</template>
		</div>
		<div class="menuItems">
			<pl-app-side-list opened$=[[opened]] variant="main" items="[[_computeItems(items, items.0)]]"
				on-menu-click="[[onMenuClick]]"></pl-app-side-list>
		</div>
		<slot name="bottom"></slot>
	`;

	constructor() {
		super();
		this._close = e => {
			let path = e.composedPath();
			if (!path.includes(this)) {
				e.preventDefault();
				this.close();
			} else {
				addEventListener('click', this._close, { capture: true, once: true });
			}
		}
	}


	openedObserver(val) {
		if (val) {
			addEventListener('click', this._close, { capture: true, once: true });
			addOverlay(this);
		} else {
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
		if (items.length == 0) {
			setTimeout(() => {
				removeOverlay(this);
			}, 300);
		}
	}


	_selectedObserver(value) {
		if (!value) {
			return;
		}
		let found = false;
		for (let i = this._selectedItemsStack.length; i--;) {
			const item = this._selectedItemsStack[i];
			if (item.items.some(item => item.id === value.id)) {
				found = true;
				break;
			} else {
				this.splice('_selectedItemsStack', i, 1)
			}
		}

		const items = this._computeItems(this.items, value);
		if (items && items.length > 0) {
			this.push('_selectedItemsStack', {
				parent: value,
				items
			});
			addOverlay(this);
			addEventListener('click', this._close, { capture: true, once: true });
		}

		this.dispatchEvent(new CustomEvent('menuItemSelected', { detail: value, bubbles: true, composed: true }));
	}

	close() {
		this.splice('_selectedItemsStack', 0, this._selectedItemsStack.length);
		this.selected = null;
		if (this.manualHide) return;
		this.opened = false;
	}
}


customElements.define("pl-app-side", PlAppSide);