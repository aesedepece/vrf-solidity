const VRFGasHelper = artifacts.require("VRFGasHelper")
const data = require("../test/data.json")

contract("VRFGasHelper - Gas consumption analysis", accounts => {
  describe("VRF verification functions:", () => {
    let helper
    before(async () => {
      helper = await VRFGasHelper.new()
    })
    for (let [index, test] of data.verify.valid.entries()) {
      it(`should verify a VRF proof (${index + 1})`, async () => {
        const publicKey = await helper.decodePoint.call(web3.utils.hexToBytes(test.pub))
        const proof = await helper.decodeProof.call(web3.utils.hexToBytes(test.pi))
        const message = web3.utils.hexToBytes(test.message)
        await helper._verify(publicKey, proof, message)
      })
    }
    it("fastVerify() (1)", async () => {
      for (let test of data.fastVerify.valid) {
        // Standard inputs
        const proof = await helper.decodeProof.call(web3.utils.hexToBytes(test.pi))
        const publicKeyX = web3.utils.hexToBytes(test.publicKey.x)
        const publicKeyY = web3.utils.hexToBytes(test.publicKey.y)
        const publicKey = [publicKeyX, publicKeyY]
        const message = web3.utils.hexToBytes(test.message)
        // VRF fast verify requirements
        // U = s*B - c*Y
        const uPointX = web3.utils.toBN(test.uPoint.x)
        const uPointY = web3.utils.toBN(test.uPoint.y)
        // V = s*H - c*Gamma
        // s*H
        const vProof1X = web3.utils.toBN(test.vComponents.sH.x)
        const vProof1Y = web3.utils.toBN(test.vComponents.sH.y)
        // c*Gamma
        const vProof2X = web3.utils.toBN(test.vComponents.cGamma.x)
        const vProof2Y = web3.utils.toBN(test.vComponents.cGamma.y)
        // Check
        await helper._fastVerify(
          publicKey,
          proof,
          message,
          [uPointX, uPointY],
          [vProof1X, vProof1Y, vProof2X, vProof2Y]
        )
      }
    })
    for (let [index, test] of data.verify.valid.entries()) {
      it(`fastVerify() (${index + 2})`, async () => {
        const publicKey = await helper.decodePoint.call(web3.utils.hexToBytes(test.pub))
        const proof = await helper.decodeProof.call(web3.utils.hexToBytes(test.pi))
        const message = web3.utils.hexToBytes(test.message)
        let params = await helper.computeFastVerifyParams.call(publicKey, proof, message)
        await helper._fastVerify(
          publicKey,
          proof,
          message,
          params[0],
          params[1]
        )
      })
    }
  })
  describe("VRF auxiliary public functions:", () => {
    let helper
    before(async () => {
      helper = await VRFGasHelper.new()
    })
    for (let [index, test] of data.proofs.valid.entries()) {
      it(`decodeProof() (${index + 1})`, async () => {
        await helper._decodeProof(web3.utils.hexToBytes(test.pi))
      })
    }
    for (let [index, test] of data.points.valid.entries()) {
      it(`decodePoint() (${index + 1})`, async () => {
        await helper._decodePoint(web3.utils.hexToBytes(test.compressed))
      })
    }
    for (let [index, test] of data.verify.valid.entries()) {
      it(`computeFastVerifyParams() (${index + 1})`, async () => {
        const publicKey = await helper.decodePoint.call(web3.utils.hexToBytes(test.pub))
        const proof = await helper.decodeProof.call(web3.utils.hexToBytes(test.pi))
        const message = web3.utils.hexToBytes(test.message)
        await helper._computeFastVerifyParams(publicKey, proof, message)
      })
    }
  })
})
