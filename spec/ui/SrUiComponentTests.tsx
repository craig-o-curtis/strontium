
import React from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from 'enzyme-adapter-react-16';
import { StrontiumApp, LoggerConfigElement, LogLevel, ServicesConfigElement, UiConfigElement, RouteConfigElement, runtime, SrUiComponent, SrAppMessage } from "../../lib/lib";
import { JSDOM } from "jsdom";
import { element } from "prop-types";

Enzyme.configure({ adapter: new Adapter() });

class BareComp extends SrUiComponent<{}, {}>{
    performRender() {
        return <div className="test-component">
        </div>;
    }
}

class WithInitialStateComp extends SrUiComponent<{ numProp: number, strProp: string }, { numState: number, strState: string }>{
    initialState() {
        return { numState: this.props.numProp, strState: this.props.strProp };
    }

    performRender() {
        return <div className="test-component">
            <p ref={this.setRef("elementRef")} />
            <p className="test-num-value">{this.state.numState}</p>
            <p className="test-str-value">{this.state.strState}</p>
        </div>;
    }
}

class WithHandlesComp extends SrUiComponent<{ numProp: number, strProp: string }, { numState: number, strState: string }>{
    initialState() {
        return { numState: this.props.numProp, strState: this.props.strProp };
    }

    public customHandles: string[] = ["a handle"];

    getHandles() {
        return this.customHandles;
    }

    performRender() {
        return <div className="test-component">
            <p ref={this.setRef("elementRef")} />
            <p className="test-num-value">{this.state.numState}</p>
            <p className="test-str-value">{this.state.strState}</p>
        </div>;
    }
}

const delay = function (milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

beforeEach(async (done) => {
    const doc = new JSDOM("<html><head><title>Test Application</title></head><body><div id=\"app-item\" <div id=\"app-content\"></div></body></html>");
    (global as any).document = doc;
    (global as any).window = doc.window;

    mount(<StrontiumApp>
        <LoggerConfigElement loggingLevel={LogLevel.Error} />
        <ServicesConfigElement />
        <UiConfigElement urlNavigationEnabled navigateOnQueryChanges appTitle="Test App" basePath="app" defaultLocation="test" rootElement="app-content" internalRenderer={(elem) => { }}>
            <RouteConfigElement title="Make a new team" route="test" view={d => <div id="test-view" />} />
        </UiConfigElement>
    </StrontiumApp>, { attachTo: document.getElementById('app-content') });

    for (var i = 0; i < 50; i++) {
        await delay(100);
        if (runtime.ui.initialized()) {
            done();
            return;
        }
    }

    done();
}, 5000);

describe('SrUiComponent', () => {
    test('renders correctly', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        expect(component.find('.test-component')).toHaveLength(1);
    });

    test('base initialState returns empty object', () => {
        const component = mount(<BareComp />);
        const initialState = (component.instance() as any).initialState();
        expect(initialState).toBeDefined();
        expect(Object.keys(initialState).length).toBe(0);
    })

    test('applies initial state properly', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        expect(component.find('.test-num-value').text()).toBe("12");
        expect(component.find('.test-str-value').text()).toBe("test");
    });

    test('applies initial state properly', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const state = (component.instance() as WithInitialStateComp).initialState();
        expect(state.numState).toBe(12);
        expect(state.strState).toBe("test");
    });

    test('setRef for key returns same function', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const func = (instance as any).setRef("key1");
        const funcAgain = (instance as any).setRef("key1");
        expect(func).toEqual(funcAgain);
    });

    test('setRef for key returns same function', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const func = (instance as any).setRef("key1");
        const funcAgain = (instance as any).setRef("key1");
        expect(func).toEqual(funcAgain);
    });

    test('setRef func stores item', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const func = (instance as any).setRef("key1");
        const obj = { someKey: "someValue" };
        func(obj);
    });

    test('setRef creates func in dictionary', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        expect((instance as any).refHandlers["key1"]).toBeUndefined();
        const func = (instance as any).setRef("key1");
        expect((instance as any).refHandlers["key1"]).toBe(func);
    });

    test('multiple setRefs return same func', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const func = (instance as any).setRef("key1");
        const func2 = (instance as any).setRef("key1");
        expect(func).toBe(func2);
    });

    test('assignRef stores item', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        (instance as any).setRef("key1");
        const obj = { someKey: "someValue" };
        (instance as any).assignRef("key1", obj);
        expect((instance as any).refHandles["key1"]).toBe(obj);
    });

    test('assignRef doesn\'t store item if handler key not present', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const obj = { someKey: "someValue" };
        (instance as any).assignRef("key1", obj);
        expect((instance as any).refHandles["key1"]).toBeUndefined();
    });

    test('getRef returns stored item', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const func = (instance as any).setRef("key1");
        const obj = { someKey: "someValue" };
        func(obj);
        const otherObj = (instance as any).getRef("key1");
        expect(otherObj).toEqual(obj);
    });

    test('getRef for non-stored item returns nothing', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const otherObj = (instance as any).getRef("key1");
        expect(otherObj).toBeUndefined();
    });

    test('cleanUpRefs removes all ref handles and handlers', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const key1func = (instance as any).setRef("key1");
        const key2func = (instance as any).setRef("key2");
        key1func("key1value");
        key2func("key2value");
        (instance as any).cleanUpRefs();
        expect((instance as any).refHandles["key1"]).toBeUndefined();
        expect((instance as any).refHandlers["key1"]).toBeUndefined();
        expect((instance as any).refHandles["key2"]).toBeUndefined();
        expect((instance as any).refHandlers["key2"]).toBeUndefined();
    });

    test('component unmounts successfully', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        component.unmount();
    });

    test('component without getHandles implemented has no handles', () => {
        const component = Enzyme.mount(<WithInitialStateComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithInitialStateComp;
        const handles = instance.handles();
        expect(handles).toBeNull();
        const handlesFromGet = (instance as any).getHandles();
        expect(handlesFromGet).toBeNull();
    });

    test('component with getHandles implemented has no handles', () => {
        const component = Enzyme.mount(<WithHandlesComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithHandlesComp;
        const handles = instance.handles();
        expect(handles).toBeDefined();
        const handlesFromGet = (instance as any).getHandles();
        expect(handlesFromGet).toBeDefined();
        expect(handles).toEqual(handlesFromGet);
        expect(handles[0]).toBe("a handle");
    });

    test('component registers itself properly as handler', () => {
        const component = Enzyme.mount(<WithHandlesComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithHandlesComp;
        instance.customHandles = ["a new handle"];
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toBeUndefined();
        (instance as any).registerHandlers();
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toBeDefined();
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toContain(instance);
    });

    test('component deregisters itself properly as handler', () => {
        const component = Enzyme.mount(<WithHandlesComp numProp={12} strProp="test" />, { attachTo: document.getElementById('app-content') });
        const instance = component.instance() as WithHandlesComp;
        instance.customHandles = ["a new handle"];
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toBeUndefined();
        (instance as any).registerHandlers();
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toBeDefined();
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toContain(instance);
        (instance as any).unregisterHandlers();
        expect((runtime.messaging as any).serviceHandlers["a new handle"]).toBeDefined();
        expect((runtime.messaging as any).serviceHandlers["a new handle"].length).toBe(0);
    });

    test('component calls onAppMessage when message received', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onAppMessage = jest.fn();
        const msg = new SrAppMessage("action", { data: 12 }, true);
        (component.instance() as BareComp).receiveMessage(msg);
        expect((component.instance() as any).onAppMessage).toHaveBeenCalledWith(msg);
    });

    test('onAppMessage calls with no adverse effects', () => {
        const component = Enzyme.mount(<BareComp />);
        const msg = new SrAppMessage("action", { data: 12 }, true);
        (component.instance() as any).onAppMessage(msg);
    });

    test('component calls internal mounting methods when mounted', () => {
        const component = Enzyme.shallow(<BareComp />);
        (component.instance() as any).doComponentDidMount = jest.fn();
        (component.instance() as any).componentDidMount();
        expect((component.instance() as any).doComponentDidMount).toHaveBeenCalled();
    });

    test('component calls internal unmounting methods when mounted', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).doComponentWillUnmount = jest.fn();
        (component.instance() as any).componentWillUnmount();
        expect((component.instance() as any).doComponentWillUnmount).toHaveBeenCalled();
    });

    test('component calls internal new props method when new props', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onNewProps = jest.fn();
        const newProps = { propData: 12 };
        (component.instance() as any).componentWillReceiveProps(newProps);
        expect((component.instance() as any).onNewProps).toHaveBeenCalledWith(newProps);
    });

    test('component calls internal performRender methods when render called', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).performRender = jest.fn();
        (component.instance() as any).render();
        expect((component.instance() as any).performRender).toHaveBeenCalled();
    });

    test('base onCleanUp calls with no adverse effects', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onCleanUp();
    });

    test('base onNewProps calls with no adverse effects', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onNewProps({});
    });

    test('base onComponentMounted calls with no adverse effects', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onComponentMounted({});
    });

    test('base onComponentWillUnmount calls with no adverse effects', () => {
        const component = Enzyme.mount(<BareComp />);
        (component.instance() as any).onComponentWillUnmount({});
    });

    test('base resizeCallback returns null', () => {
        const component = Enzyme.mount(<BareComp />);
        const callback = (component.instance() as any).resizeCallback();
        expect(callback).toBeNull();
    });

    test('doComponentDidMount sets internal mounted flag and calls appropriate set-up methods', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        const instance = component.instance() as any;
        instance.registerHandlers = jest.fn();
        instance.registerResizeHandler = jest.fn();
        instance.onComponentMounted = jest.fn();

        expect(instance.componentMounted).toBe(false);
        expect(instance.registerHandlers).toHaveBeenCalledTimes(0);
        expect(instance.registerResizeHandler).toHaveBeenCalledTimes(0);
        expect(instance.onComponentMounted).toHaveBeenCalledTimes(0);

        instance.doComponentDidMount();

        expect(instance.componentMounted).toBe(true);
        expect(instance.registerHandlers).toHaveBeenCalledTimes(1);
        expect(instance.registerResizeHandler).toHaveBeenCalledTimes(1);
        expect(instance.onComponentMounted).toHaveBeenCalledTimes(1);
    });

    test('doComponentWillUnmount sets internal mounted flag and calls appropriate tear-down methods', () => {
        const component = Enzyme.mount(<BareComp />);
        const instance = component.instance() as any;
        instance.cancelAllDeferrals = jest.fn();
        instance.unregisterResizeHandler = jest.fn();
        instance.unregisterHandlers = jest.fn();
        instance.onComponentWillUnmount = jest.fn();
        instance.cleanUpRefs = jest.fn();
        instance.cleanUp = jest.fn();

        expect(instance.componentMounted).toBe(true);
        expect(instance.cancelAllDeferrals).toHaveBeenCalledTimes(0);
        expect(instance.unregisterResizeHandler).toHaveBeenCalledTimes(0);
        expect(instance.unregisterHandlers).toHaveBeenCalledTimes(0);
        expect(instance.onComponentWillUnmount).toHaveBeenCalledTimes(0);
        expect(instance.cleanUpRefs).toHaveBeenCalledTimes(0);
        expect(instance.cleanUp).toHaveBeenCalledTimes(0);

        instance.doComponentWillUnmount();

        expect(instance.componentMounted).toBe(false);
        expect(instance.cancelAllDeferrals).toHaveBeenCalledTimes(1);
        expect(instance.unregisterResizeHandler).toHaveBeenCalledTimes(1);
        expect(instance.unregisterHandlers).toHaveBeenCalledTimes(1);
        expect(instance.onComponentWillUnmount).toHaveBeenCalledTimes(1);
        expect(instance.cleanUpRefs).toHaveBeenCalledTimes(1);
        expect(instance.cleanUp).toHaveBeenCalledTimes(1);
    });

    test('cleanUp nulls properties and calls onCleanUp', () => {
        const component = Enzyme.mount(<BareComp />);
        const instance = component.instance() as any;
        instance.onCleanUp = jest.fn();

        expect(instance.stateHelpers).toBeDefined();
        expect(instance.deferHandlers).toBeDefined();
        expect(instance.refHandlers).toBeDefined();
        expect(instance.refHandles).toBeDefined();
        expect(instance.onCleanUp).toHaveBeenCalledTimes(0);

        instance.cleanUp();

        expect(instance.stateHelpers).toBeNull();
        expect(instance.deferHandlers).toBeNull();
        expect(instance.refHandlers).toBeNull();
        expect(instance.refHandles).toBeNull();
        expect(instance.onCleanUp).toHaveBeenCalledTimes(1);
    });

    test('mounted returns componentMounted property', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        expect((component.instance() as BareComp).mounted()).toBe(false);
        (component.instance() as any).componentMounted = true;
        expect((component.instance() as BareComp).mounted()).toBe(true);
    });

    test('registerResizeHandler does nothing if resizeCallback is null', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        const instance = component.instance() as any;
        instance.unregisterResizeHandler = jest.fn();
        window.addEventListener = jest.fn();
        instance.registerResizeHandler();
        expect(instance.unregisterResizeHandler).toHaveBeenCalledTimes(1);
        expect(instance.resizeListener).toBeNull();
        expect(window.addEventListener).toHaveBeenCalledTimes(0);
    });

    test('registerResizeHandler registers listener if resizeCallback is present', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        const instance = component.instance() as any;
        instance.unregisterResizeHandler = jest.fn();
        instance.resizeCallback = function () { return () => { } };
        window.addEventListener = jest.fn();
        instance.registerResizeHandler();
        expect(instance.unregisterResizeHandler).toHaveBeenCalledTimes(1);
        expect(instance.resizeListener).toBeDefined();
        expect(window.addEventListener).toHaveBeenCalledTimes(1);
    });

    test('unregisterResizeHandler unregisters listener if resizeCallback is present', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        const instance = component.instance() as any;
        instance.resizeListener = (e: Event) => {};
        window.removeEventListener = jest.fn();
        instance.unregisterResizeHandler();
        expect(instance.resizeListener).toBeNull();
        expect(window.removeEventListener).toHaveBeenCalledTimes(1);
    });

    test('unregisterResizeHandler does nothing if resizeCallback is not present', () => {
        const component = Enzyme.shallow(<BareComp />, { disableLifecycleMethods: true });
        const instance = component.instance() as any;
        window.removeEventListener = jest.fn();
        instance.unregisterResizeHandler();
        expect(instance.resizeListener).toBeNull();
        expect(window.removeEventListener).toHaveBeenCalledTimes(0);
    });
});