const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { id: owner } = request.auth.credentials;
    const useCasePayload = { ...request.payload, owner };
    const addedThread = await addThreadUseCase.execute(useCasePayload);
    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadByIdHandler(request, h) {
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);
    const { threadId } = request.params;
    const thread = await getDetailThreadUseCase.execute(threadId);
    return h.response({
      status: 'success',
      data: {
        thread,
      },
    });
  }
}

module.exports = ThreadsHandler;
