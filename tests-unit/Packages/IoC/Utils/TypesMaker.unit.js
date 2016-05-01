import Maker from 'Packages/IoC/Utils/Maker'


describe('Packages/IoC/Utils/Maker', function() {
    
    beforeEach(function() {
        this.TestClass1 = class TestClass1 {}
        this.TestClass2 = class TestClass2 {}
        this.iocMock = { make: Class => new Class }
        this.maker = new Maker
    })

    it('must support hash-maps', function() {
        const results = this.maker.make(this.iocMock, {
            test1: this.TestClass1,
            test2: this.TestClass2,
        })

        expect(results.test1 instanceof this.TestClass1).to.be.ok
        expect(results.test2 instanceof this.TestClass2).to.be.ok
    })

    it('must use class-names in camelCase as keys for the result', function() {
        const results = this.maker.make(this.iocMock, [
            this.TestClass1,
            this.TestClass2,
        ])

        expect(results.testClass1 instanceof this.TestClass1).to.be.ok
        expect(results.testClass2 instanceof this.TestClass2).to.be.ok
    })
    
})