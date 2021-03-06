import ReactTestUtils from 'react-addons-test-utils';
import SortableGrid, {SortableGridItem} from './SortableGrid';
import React from 'react';
import {expect} from 'chai';
import sinon from 'sinon';

describe('SortableGrid component', function() {
    var shallowRenderer, output, reorderStub;

    function render(input) {
        shallowRenderer = ReactTestUtils.createRenderer();

        shallowRenderer.render(input);

        return shallowRenderer.getRenderOutput();
    }

    it('renders div with 100% width and height', function() {
        output = render(<SortableGrid columns={4} rows={4}/>);

        expect(output.type).to.equal('div');
        expect(output.props.style.width).to.equal('100%');
        expect(output.props.style.height).to.equal('100%');
        expect(output.props.style.position).to.equal('relative');
    });

    it('generates grid of divs', function() {
        output = render(<SortableGrid columns={4} rows={4}>
            <SortableGridItem position={0} key={0} itemKey={0}></SortableGridItem>
            <SortableGridItem position={1} key={1} itemKey={1}></SortableGridItem>
            <SortableGridItem position={2} key={2} itemKey={2}></SortableGridItem>
            <SortableGridItem position={3} key={3} itemKey={3}></SortableGridItem>
            <SortableGridItem position={4} key={4} itemKey={4}></SortableGridItem>
            <SortableGridItem position={5} key={5} itemKey={5}></SortableGridItem>
        </SortableGrid>);

        expect(output.props.children.length).to.equal(6);
        expect(output.props.children[0].type).to.equal('div');

        expect(output.props.children[0].props.style.width).to.equal('25%');
        expect(output.props.children[0].props.style.height).to.equal('25%');

        expect(output.props.children[0].props.style.top).to.equal('0%');
        expect(output.props.children[0].props.style.left).to.equal('0%');

        expect(output.props.children[1].props.style.top).to.equal('0%');
        expect(output.props.children[1].props.style.left).to.equal('25%');

        expect(output.props.children[5].props.style.top).to.equal('25%');
        expect(output.props.children[5].props.style.left).to.equal('25%');

        expect(output.props.children[1].props.style.position).to.equal('absolute');
    });

    it('ignores all mousemove if there was no mousedown on block', function() {
        output = render(<SortableGrid columns={4} rows={4}/>);

        output.props.onMouseMove({
            clientX: 20,
            clientY: 40,
        });

        var outputAfterMove = shallowRenderer.getRenderOutput();

        expect(output).to.eq(outputAfterMove);
    });

    function testMoveBlock(blockIndex = 2) {
        reorderStub = sinon.spy();
        output = render(<SortableGrid columns={4} rows={4} onReorder={reorderStub}>
            <SortableGridItem position={0} key={0} itemKey={0}></SortableGridItem>
            <SortableGridItem position={1} key={1} itemKey={1}></SortableGridItem>
            <SortableGridItem position={2} key={2} itemKey={2}></SortableGridItem>
            <SortableGridItem position={3} key={3} itemKey={3}></SortableGridItem>
            <SortableGridItem position={4} key={4} itemKey={4}></SortableGridItem>
            <SortableGridItem position={5} key={5} itemKey={5}></SortableGridItem>
            <SortableGridItem position={6} key={6} itemKey={6}></SortableGridItem>
        </SortableGrid>);

        var instance = shallowRenderer._instance._instance;

        instance.refs = {
            container: {
                offsetWidth: 200,
                offsetHeight: 200,
            },
        };

        output.props.children[blockIndex].props.onMouseDown({
            clientX: 0,
            clientY: 0,
        });

        output.props.onMouseMove({
            clientX: 20,
            clientY: 40,
        });

        output = shallowRenderer.getRenderOutput();

        expect(output.props.children[blockIndex].props.style.marginLeft).to.equal('10%');
        expect(output.props.children[blockIndex].props.style.marginTop).to.equal('20%');
    }

    it('moves block on drag', testMoveBlock);

    function testBlockStyle(index, style, value) {
        expect(output.props.children[index].props.style[style]).to.equal(value);
    }

    it('reorders blocks on proper move', function() {
        testMoveBlock();

        output.props.onMouseMove({
            clientX: 1,
            clientY: 1,
        });

        expect(reorderStub.called).to.eq(false);

        output = shallowRenderer.getRenderOutput();

        output.props.onMouseMove({
            clientX: 0,
            clientY: 40,
        });

        expect(reorderStub.called).to.eq(true);

        const newPositions = reorderStub.args[0][0];

        expect(newPositions).to.deep.equal({
            '0': 0,
            '1': 1,
            '2': 6,
            '3': 2,
            '4': 3,
            '5': 4,
            '6': 5,
        });

        shallowRenderer.render(<SortableGrid columns={4} rows={4} onReorder={reorderStub}>
            <SortableGridItem position={newPositions[0]} key={0} itemKey={0}></SortableGridItem>
            <SortableGridItem position={newPositions[1]} key={1} itemKey={1}></SortableGridItem>
            <SortableGridItem position={newPositions[2]} key={2} itemKey={2}></SortableGridItem>
            <SortableGridItem position={newPositions[3]} key={3} itemKey={3}></SortableGridItem>
            <SortableGridItem position={newPositions[4]} key={4} itemKey={4}></SortableGridItem>
            <SortableGridItem position={newPositions[5]} key={5} itemKey={5}></SortableGridItem>
            <SortableGridItem position={newPositions[6]} key={6} itemKey={6}></SortableGridItem>
        </SortableGrid>);

        output = shallowRenderer.getRenderOutput();

        testBlockStyle(1, 'left', '25%');
        testBlockStyle(1, 'top', '0%');

        testBlockStyle(2, 'left', '50%');
        testBlockStyle(2, 'top', '0%');
        testBlockStyle(2, 'zIndex', 3);

        testBlockStyle(3, 'left', '50%');
        testBlockStyle(3, 'top', '0%');
        testBlockStyle(5, 'zIndex', 0);

        testBlockStyle(4, 'left', '75%');
        testBlockStyle(4, 'top', '0%');
        testBlockStyle(4, 'zIndex', 1); // This block moves from edge-to-edge

        testBlockStyle(5, 'left', '0%');
        testBlockStyle(5, 'top', '25%');
        testBlockStyle(5, 'zIndex', 0);

        testBlockStyle(6, 'left', '25%');
        testBlockStyle(6, 'top', '25%');
    });

    it('reorders blocks on move backward', function() {
        testMoveBlock(5);

        output.props.onMouseMove({
            clientX: 0,
            clientY: -40,
        });

        const newPositions = reorderStub.args[0][0];

        expect(newPositions).to.deep.equal({
            '0': 0,
            '1': 2,
            '2': 3,
            '3': 4,
            '4': 5,
            '5': 1,
            '6': 6,
        });

        shallowRenderer.render(<SortableGrid columns={4} rows={4} onReorder={reorderStub}>
            <SortableGridItem position={newPositions[0]} key={0} itemKey={0}></SortableGridItem>
            <SortableGridItem position={newPositions[1]} key={1} itemKey={1}></SortableGridItem>
            <SortableGridItem position={newPositions[2]} key={2} itemKey={2}></SortableGridItem>
            <SortableGridItem position={newPositions[3]} key={3} itemKey={3}></SortableGridItem>
            <SortableGridItem position={newPositions[4]} key={4} itemKey={4}></SortableGridItem>
            <SortableGridItem position={newPositions[5]} key={5} itemKey={5}></SortableGridItem>
            <SortableGridItem position={newPositions[6]} key={6} itemKey={6}></SortableGridItem>
        </SortableGrid>);

        output = shallowRenderer.getRenderOutput();

        testBlockStyle(0, 'left', '0%');
        testBlockStyle(0, 'top', '0%');

        testBlockStyle(1, 'left', '50%');
        testBlockStyle(1, 'top', '0%');

        testBlockStyle(2, 'left', '75%');
        testBlockStyle(2, 'top', '0%');

        testBlockStyle(3, 'left', '0%');
        testBlockStyle(3, 'top', '25%');
        testBlockStyle(3, 'zIndex', 1); // This block moves from edge-to-edge

        testBlockStyle(4, 'left', '25%');
        testBlockStyle(4, 'top', '25%');

        testBlockStyle(5, 'left', '25%');
        testBlockStyle(5, 'top', '25%');
    });

    it('stops draging on mouse up', function() {
        testMoveBlock();

        expect(output.props.children[2].props.style.marginLeft).to.equal('10%');
        expect(output.props.children[2].props.style.marginTop).to.equal('20%');
    });

    it('renders blocks with given items', function() {
        const item = <SortableGridItem position={0}></SortableGridItem>;

        output = render(<SortableGrid columns={4} rows={4}>{item}</SortableGrid>);

        expect(output.props.children[0].props.children).to.equal(item);
    });

    it('stops dragging on mouseup', function() {
        testMoveBlock();

        output.props.onMouseUp();

        output = shallowRenderer.getRenderOutput();

        expect(output.props.children[2].props.style.marginLeft).to.equal('0%');
        expect(output.props.children[2].props.style.marginTop).to.equal('0%');

        // Last dragging block should has 2 index
        expect(output.props.children[2].props.style.zIndex).to.equal(2);
    });

    it('stops dragging on mouseleave', function() {
        testMoveBlock();

        output.props.onMouseLeave();

        output = shallowRenderer.getRenderOutput();

        expect(output.props.children[2].props.style.marginLeft).to.equal('0%');
        expect(output.props.children[2].props.style.marginTop).to.equal('0%');

        // Last dragging block should has 2 index
        expect(output.props.children[2].props.style.zIndex).to.equal(2);
    });

    it('prevents text selecting', function() {
        output = render(<SortableGrid columns={4} rows={4}>
            <SortableGridItem position={0} key={0} itemKey={0}></SortableGridItem>
        </SortableGrid>);

        const preventDefaultSpy = sinon.spy();

        output.props.children[0].props.onMouseDown({
            preventDefault: preventDefaultSpy,
        });

        expect(preventDefaultSpy.called).to.eq(true);
    });

    describe('touch events', () => {
        var output, instance, clock = null;

        afterEach(() => {
            if (clock) {
                clock.restore();
                clock = null;
            }
        });

        function _render() {
            output = render(<SortableGrid columns={4} rows={4}>
                <SortableGridItem position={0}></SortableGridItem>
                <SortableGridItem position={1}></SortableGridItem>
            </SortableGrid>);

            instance = shallowRenderer._instance._instance;

            instance.refs = {
                container: {
                    offsetWidth: 200,
                    offsetHeight: 200,
                },
            };
        }

        function testTouchStart(touches = [{
            clientX: 0,
            clientY: 0,
        }], tick = 500) {
            let preventDefaultStub = sinon.stub();

            clock = sinon.useFakeTimers();

            output.props.children[0].props.onTouchStart({
                touches: touches,
                preventDefault: preventDefaultStub,
            });

            clock.tick(tick);

            expect(preventDefaultStub.called).to.eq(false);
        }

        function expectBlockPosition(left, top) {
            output = shallowRenderer.getRenderOutput();

            expect(output.props.children[0].props.style.marginLeft).to.equal(left);
            expect(output.props.children[0].props.style.marginTop).to.equal(top);
        }

        function testDragging(shouldDrag = true) {
            let preventDefaultStub = sinon.stub();

            output.props.onTouchMove({
                touches: [{
                    clientX: 20,
                    clientY: 40,
                }],
                preventDefault: preventDefaultStub,
            });

            expectBlockPosition(
                shouldDrag ? '10%' : '0%',
                shouldDrag ? '20%' : '0%',
            );

            expect(preventDefaultStub.called).to.eq(shouldDrag);
        }

        it('should handle touch events', () => {
            _render();
            testTouchStart();
            testDragging();
        });

        it('should not react on multi touch', () => {
            _render();

            testTouchStart([{
                clientX: 0,
                clientY: 0,
            }, {
                clientX: 0,
                clientY: 0,
            }], false);

            testDragging(false);
        });

        it('should stop dragging on touchStop', () => {
            _render();
            testTouchStart();
            testDragging();

            output.props.onTouchEnd({
                touches: [{
                    clientX: 20,
                    clientY: 40,
                }],
            });

            expectBlockPosition('0%', '0%');
        });

        it('shouldnt drag when touch move eairlier than 500ms after start', () => {
            _render();
            testTouchStart( [{
                clientX: 0,
                clientY: 0,
            }], 0);
            testDragging(false);
            clock.tick(501);
            testDragging(false);
        });
    });
});
