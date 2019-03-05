package gov.nih.nlm.cde.sdcValidate;

import java.util.Collections;
import java.util.Map;

import com.serverless.ApiGatewayResponse;
import com.serverless.Response;
import org.apache.log4j.Logger;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import support.XMLValidator;

public class Handler implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

	private static final Logger LOG = Logger.getLogger(Handler.class);

	@Override
	public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
		LOG.info("received: " + input);

		XMLValidator validated = new XMLValidator(
				getClass().getResource("/sdc/SDCFormDesign.xsd").getFile(),
				(String)input.get("input")
		);

		Response responseBody = new Response(validated.withErrors ? String.join("\n", validated.errors) : "", input);
		return ApiGatewayResponse.builder()
				.setStatusCode(200)
				.setObjectBody(responseBody)
				.setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
				.build();
	}
}
