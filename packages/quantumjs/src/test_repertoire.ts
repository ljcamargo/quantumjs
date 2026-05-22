import { circuit, pi, div, pipeline } from './index.js';
import * as Quantum from './index.js';

// Test 1: Basic Gates & Chaining
export function testBasic() {
    console.log("Test 1: Basic Gates");
    const c = circuit({ qubits: 2 }, Q => {
        Q.bit(0).h().x().y().z().s().s_().t().t_().id().reset();
        Q.bit(0).cx(Q.bit(1));
        Q.bit(0).measure();
    });
    console.log(c.compile());
}

// Test 2: Multi-qubit gates & conditions
export function testAdvanced() {
    console.log("Test 2: Advanced Gates & Conditions");
    const c = circuit({ qubits: 3 }, Q => {
        Q.bit(0).ccx(Q.bit(1), Q.bit(2));
        Q.bit(0).ch(Q.bit(1));
        Q.bit(0)._if(Q.cbit(0), q => q.x());
        Q.bit(1).measureX();
    });
    console.log(c.compile());
}

// Test 3: QFT (from README)
export function testQFT() {
    console.log("Test 3: QFT");
    const values = [1, 0, 1];
    const c = circuit({ qubits: 3 }, Q => {
        Q.comment("3-bit Quantum Fourier Transform");
        Q.input(values);
        Q.barrier().brk();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < i; j++) {
                // In original: Q.bit(i).cu1(Q.π.div(Math.pow(2, i-j)), j);
                // In new DSL we use cp for phase
                Q.bit(i).cp(Q.bit(j), Q.π.div(Math.pow(2, i - j)));
            }
            Q.bit(i).h().brk();
        }
        Q.all().measure();
    });
    console.log(c.compile());
}

// Test 4: IQFT (Single operation _if)
export function testIQFT() {
    console.log("Test 4: IQFT style _if");
    const c = circuit({ qubits: 2 }, Q => {
        Q.bit(0).h();
        Q.bit(1).x()._if(Q.cbit(0));
        Q.bit(1).measure();
    });
    console.log(c.compile());
}

// Test 5: Scoped Layout Visualizer (Staircases)
export function testScopedQFT() {
    console.log("Test 5: Scoped Layout Visualizer (Staircases)");
    const c = circuit({ qubits: 3 }, Q => {
        Q.comment("growUp staircase");
        Q.growUp(q => {
            q.first().cx(q.last());
        });
        Q.barrier();

        Q.comment("growDown staircase");
        Q.growDown(q => {
            q.first().cx(q.last());
        });
        Q.barrier();

        Q.comment("shrinkUp staircase");
        Q.shrinkUp(q => {
            q.first().cx(q.last());
        });
        Q.barrier();

        Q.comment("shrinkDown staircase");
        Q.shrinkDown(q => {
            q.first().cx(q.last());
        });
        Q.all().measure();
    });
    console.log(c.compile());
}



// Test 6: Pipeline execution
export function testPipeline() {
    console.log("Test 6: Pipeline");
    const p = pipeline(
        { qubits: 3 },
        "101",
        Q => Q.all().measure(),
        Q => {
            Q.comment("Core algorithm step");
            Q.bit(0).cx(Q.bit(1));
        }
    );
    console.log(p.compile());
}

// Run tests
testBasic();
testAdvanced();
testQFT();
testIQFT();
testScopedQFT();
testPipeline();
