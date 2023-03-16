const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
  }

  async postReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
    const { commentId, threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      ...request.payload, commentId, threadId, owner,
    };
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = {
      threadId, commentId, replyId, owner,
    };
    await deleteReplyUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = RepliesHandler;
