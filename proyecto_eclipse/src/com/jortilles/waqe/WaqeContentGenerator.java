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

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.pentaho.platform.api.repository2.unified.RepositoryFile;
import org.pentaho.platform.engine.services.solution.BaseContentGenerator;


public class WaqeContentGenerator extends BaseContentGenerator {
    
	private static final long serialVersionUID = 1L;
	
	private static final Log logger = LogFactory.getLog( WaqeContentGenerator.class );

	public WaqeContentGenerator() {
		super();
	}

	@Override
	public Log getLogger() {
		return logger;
	}
	
	/**
	 * @return the editable
	 */
	public boolean isEditable() {
		return true;
	}
	

	/**
	 * @throws IOException
	 * @throws ServletException
	 * @see org.pentaho.platform.engine.services.solution.BaseContentGenerator#createContent()
	 */
	@Override
	public void createContent() throws ServletException, IOException {
		HttpServletRequest request = (HttpServletRequest) this.parameterProviders
				.get("path").getParameter("httprequest");

		HttpServletResponse response = (HttpServletResponse) this.parameterProviders
				.get("path").getParameter("httpresponse");

		RepositoryFile file = (RepositoryFile) parameterProviders.get("path")
				.getParameter("file");

		request.setAttribute("file", file);
		
		request.getRequestDispatcher(
				"/plugin/waqe/api/main?editable=" + isEditable())
				.forward(request, response);
		
		
	}
}


