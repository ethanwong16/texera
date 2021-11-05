/*
 * This file is generated by jOOQ.
 */
package edu.uci.ics.texera.web.model.jooq.generated.tables.daos;


import edu.uci.ics.texera.web.model.jooq.generated.tables.WorkflowOfProject;
import edu.uci.ics.texera.web.model.jooq.generated.tables.records.WorkflowOfProjectRecord;

import java.util.List;

import org.jooq.Configuration;
import org.jooq.Record2;
import org.jooq.impl.DAOImpl;
import org.jooq.types.UInteger;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class WorkflowOfProjectDao extends DAOImpl<WorkflowOfProjectRecord, edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject, Record2<UInteger, UInteger>> {

    /**
     * Create a new WorkflowOfProjectDao without any configuration
     */
    public WorkflowOfProjectDao() {
        super(WorkflowOfProject.WORKFLOW_OF_PROJECT, edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject.class);
    }

    /**
     * Create a new WorkflowOfProjectDao with an attached configuration
     */
    public WorkflowOfProjectDao(Configuration configuration) {
        super(WorkflowOfProject.WORKFLOW_OF_PROJECT, edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject.class, configuration);
    }

    @Override
    public Record2<UInteger, UInteger> getId(edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject object) {
        return compositeKeyRecord(object.getWid(), object.getPid());
    }

    /**
     * Fetch records that have <code>wid BETWEEN lowerInclusive AND upperInclusive</code>
     */
    public List<edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject> fetchRangeOfWid(UInteger lowerInclusive, UInteger upperInclusive) {
        return fetchRange(WorkflowOfProject.WORKFLOW_OF_PROJECT.WID, lowerInclusive, upperInclusive);
    }

    /**
     * Fetch records that have <code>wid IN (values)</code>
     */
    public List<edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject> fetchByWid(UInteger... values) {
        return fetch(WorkflowOfProject.WORKFLOW_OF_PROJECT.WID, values);
    }

    /**
     * Fetch records that have <code>pid BETWEEN lowerInclusive AND upperInclusive</code>
     */
    public List<edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject> fetchRangeOfPid(UInteger lowerInclusive, UInteger upperInclusive) {
        return fetchRange(WorkflowOfProject.WORKFLOW_OF_PROJECT.PID, lowerInclusive, upperInclusive);
    }

    /**
     * Fetch records that have <code>pid IN (values)</code>
     */
    public List<edu.uci.ics.texera.web.model.jooq.generated.tables.pojos.WorkflowOfProject> fetchByPid(UInteger... values) {
        return fetch(WorkflowOfProject.WORKFLOW_OF_PROJECT.PID, values);
    }
}
