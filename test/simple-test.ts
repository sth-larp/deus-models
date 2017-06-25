import { testHelper } from './helpers/models-tests-helpers';
import { expect } from 'chai';

describe('Simple Test #1', () =>{
    it('should be TestHelperString', ()=>{
        let result = testHelper();
        expect(result).to.equal("Test Helper String");
    });
});

