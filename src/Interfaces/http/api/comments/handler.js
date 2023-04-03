const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
    const { threadId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = { ...request.payload, threadId, owner };
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentByIdHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;
    const useCasePayload = { threadId, commentId, owner };
    await deleteCommentUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
    });
  }

  async likeCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const useCasePayload = { threadId, commentId, userId };
    await likeCommentUseCase.execute(useCasePayload);

    return h.response({
      status: 'success',
    });
  }
}

module.exports = CommentsHandler;
