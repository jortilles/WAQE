/*
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at
 * http://mozilla.org/MPL/2.0/.
 *
 * Covered Software is provided under this License on an �as is� basis,
 * without warranty of any kind, either expressed, implied, or statutory,
 * including, without limitation, warranties that the Covered Software is
 * free of defects, merchantable, fit for a particular purpose or non-infringing.
 * The entire risk as to the quality and performance of the Covered Software is with You.
 * Should any Covered Software prove defective in any respect, You (not any Contributor)
 * assume the cost of any necessary servicing, repair, or correction.
 * This disclaimer of warranty constitutes an essential part of this License.
 * No use of any Covered Software is authorized under this License except under this disclaimer.
 */

package com.jortilles.waqe;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.engine.IParameterProvider;
import pt.webdetails.cpf.PentahoPluginEnvironment;
import pt.webdetails.cpf.SimpleContentGenerator;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;


public class WaqeContentGenerator extends SimpleContentGenerator {
    
	private static final long serialVersionUID = 1L;
	
	private static final Log logger = LogFactory.getLog( WaqeContentGenerator.class );

	public WaqeContentGenerator() {
		super();
	}

	@Override
	public Log getLogger() {
		return logger;
	}

	@Override
	public void createContent() throws Exception {
		IParameterProvider pathParams = parameterProviders.get( MethodParams.PATH );
		String filePath = pathParams.getStringParameter( MethodParams.PATH, "" );
    
		HttpServletResponse response = (HttpServletResponse) pathParams.getParameter( "httpresponse" );

		System.out.println("************************HERE************************");
        System.out.println("GENERATING CONTENT AND STUFF");
        String apiUrl = PentahoPluginEnvironment.getInstance().getUrlProvider().getPluginBaseUrl();
		String url = apiUrl + "main?json=" + filePath;

		if (response == null) {
			logger.error("response not found");
			return;
		}
		try {
			response.sendRedirect( url );
			response.getOutputStream().flush();
		} catch ( IOException e ) {
			logger.error("could not redirect", e);
		}
	}

	@Override
	public String getPluginName() {
		return "waqe";
	}
  
	private class MethodParams {
		public static final String PATH = "path";
	}

}
